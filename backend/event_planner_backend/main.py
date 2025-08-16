from fastapi import Depends, FastAPI, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import PyPDF2
import io
import os
import docx
from openai import OpenAI

from event_planner_backend import crud, models, schemas, auth
from event_planner_backend.database import SessionLocal, engine


client = OpenAI(api_key=auth.OPENAI_API_KEY)


# Create a directory for file uploads
UPLOAD_DIRECTORY = "./uploads"
if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except auth.JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


# --- AI Helper Functions ---
def extract_text_from_file(contents: bytes, content_type: str) -> str:
    """Extracts text from PDF, DOCX, or TXT files based on their content."""
    text = ""

    if content_type == "application/pdf":
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
            for page in pdf_reader.pages:
                text += page.extract_text() or ""
        except PyPDF2.errors.PdfReadError as e:
            # Handle cases where the PDF is malformed
            raise HTTPException(status_code=400, detail=f"Could not read PDF file: {e}")
    elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        doc = docx.Document(io.BytesIO(contents))
        for para in doc.paragraphs:
            text += para.text + "\n"
    elif content_type == "text/plain":
        text = contents.decode("utf-8")
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {content_type}")
    return text


def generate_summary(text: str, prompt: str):
    """Generates a summary using OpenAI's API."""
    if not client.api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured.")
    try:
        response = client.chat.completions.create(model="gpt-3.5-turbo",
        messages=[
            {"role": "system",
             "content": "You are a helpful assistant for an event planner. Your task is to summarize documents concisely."},
            {"role": "user", "content": f"{prompt}:\n\n---\n\n{text}"}
        ])
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {e}")

# --- Existing Endpoints (Unchanged) ---
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_user)):
    return current_user


@app.post("/projects/", response_model=schemas.Project)
def create_project(
        project: schemas.ProjectCreate, db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_user)
):
    return crud.create_project(db=db, project=project, user_id=current_user.id)


@app.get("/projects/", response_model=list[schemas.Project])
def read_projects(db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    projects = crud.get_projects(db, user_id=current_user.id, skip=0, limit=100)
    return projects


@app.get("/projects/{project_id}", response_model=schemas.Project)
def read_project(project_id: int, db: Session = Depends(get_db),
                 current_user: schemas.User = Depends(get_current_user)):
    db_project = crud.get_project(db, project_id=project_id, user_id=current_user.id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@app.get("/projects/{project_id}/documents/", response_model=list[schemas.Document])
def read_documents_for_project(
        project_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)
):
    # Ensure the user owns the project
    db_project = crud.get_project(db, project_id=project_id, user_id=current_user.id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return crud.get_documents_for_project(db, project_id=project_id)


@app.get("/projects/{project_id}/documents/summary", response_model=dict)
def get_aggregated_summary(
        project_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)
):
    # Ensure the user owns the project
    db_project = crud.get_project(db, project_id=project_id, user_id=current_user.id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    documents = crud.get_documents_for_project(db, project_id=project_id)
    if not documents:
        return {"summary": "No documents available to generate a summary."}

    # Combine all individual summaries
    combined_summaries = "\n\n---\n\n".join([f"Document: {doc.filename}\nSummary: {doc.summary}" for doc in documents])

    summary_prompt = "You are an expert event planning assistant. Based on the following document summaries, create a high-level overview of the project's status. Highlight key upcoming deadlines, total financial commitments, and any potential risks or conflicts."
    aggregated_summary = generate_summary(combined_summaries, summary_prompt)

    return {"summary": aggregated_summary}


# --- Existing Invoice Endpoints (Unchanged) ---
@app.post("/projects/{project_id}/invoices/", response_model=schemas.Invoice)
async def create_invoice_for_project(
        project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_user)
):
    contents = await file.read()
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()

    vendor = None
    amount = None
    due_date = None

    for line in text.split('\n'):
        if "Vendor:" in line:
            vendor = line.split("Vendor:")[1].strip()
        if "Amount:" in line:
            amount = float(line.split("Amount:")[1].strip())
        if "Due Date:" in line:
            due_date_str = line.split("Due Date:")[1].strip()
            due_date = datetime.strptime(due_date_str, "%Y-%m-%d")

    if not all([vendor, amount, due_date]):
        raise HTTPException(status_code=400, detail="Could not parse invoice")

    invoice_data = schemas.InvoiceCreate(
        filename=file.filename,
        vendor=vendor,
        amount=amount,
        due_date=due_date
    )

    return crud.create_invoice(db=db, invoice=invoice_data, project_id=project_id)


@app.get("/invoices/", response_model=list[schemas.Invoice])
def read_invoices(db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    invoices = crud.get_invoices(db, skip=0, limit=100)
    return invoices


@app.put("/invoices/{invoice_id}", response_model=schemas.Invoice)
def update_invoice(
        invoice_id: int, invoice: schemas.InvoiceUpdate, db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_user)
):
    return crud.update_invoice(db=db, invoice_id=invoice_id, is_paid=invoice.is_paid)

@app.post("/projects/{project_id}/documents/", response_model=schemas.Document)
async def upload_document_for_project(
        project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_user)
):
    # Ensure the user owns the project
    db_project = crud.get_project(db, project_id=project_id, user_id=current_user.id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    # THE FIX: Read the file content ONCE into a variable.
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Cannot process an empty file.")

    # Save the uploaded file to a local directory using the stored content
    file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
    with open(file_location, "wb+") as file_object:
        file_object.write(contents)


    # Extract text and generate summary from the stored content
    text = extract_text_from_file(contents, file.content_type)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from the document.")

    summary_prompt = "Summarize the key information from this document for an event plan. Include any names, dates, and monetary values."
    summary = generate_summary(text, summary_prompt)

    document_data = schemas.DocumentCreate(
        filename=file.filename,
        file_type=file.content_type,
        summary=summary
    )
    return crud.create_document(db=db, document=document_data, project_id=project_id)