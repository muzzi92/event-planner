from sqlalchemy.orm import Session
from event_planner_backend import models, schemas
from event_planner_backend.auth import get_password_hash

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_projects(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Project).filter(models.Project.owner_id == user_id).offset(skip).limit(limit).all()

def get_project(db: Session, project_id: int, user_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == user_id).first()

def create_project(db: Session, project: schemas.ProjectCreate, user_id: int):
    db_project = models.Project(**project.dict(), owner_id=user_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_invoices(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Invoice).offset(skip).limit(limit).all()

def create_invoice(db: Session, invoice: schemas.InvoiceCreate, project_id: int):
    db_invoice = models.Invoice(**invoice.dict(), project_id=project_id)
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def update_invoice(db: Session, invoice_id: int, is_paid: bool):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if db_invoice:
        db_invoice.is_paid = is_paid
        db.commit()
        db.refresh(db_invoice)
    return db_invoice

# New CRUD functions for Documents
def get_documents_for_project(db: Session, project_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Document).filter(models.Document.project_id == project_id).offset(skip).limit(limit).all()

def create_document(db: Session, document: schemas.DocumentCreate, project_id: int):
    db_document = models.Document(**document.dict(), project_id=project_id)
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document