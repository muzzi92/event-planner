from pydantic import BaseModel
from typing import List, Optional
import datetime


# New Document Schemas
class DocumentBase(BaseModel):
    filename: str
    file_type: str
    summary: str


class DocumentCreate(DocumentBase):
    pass


class Document(DocumentBase):
    id: int
    uploaded_at: datetime.datetime
    project_id: int

    class Config:
        orm_mode = True


# ---

class InvoiceBase(BaseModel):
    filename: str
    due_date: datetime.datetime
    amount: float
    vendor: str
    is_paid: bool = False


class InvoiceCreate(InvoiceBase):
    pass


class Invoice(InvoiceBase):
    id: int
    project_id: int
    upload_date: datetime.datetime

    class Config:
        orm_mode = True


class InvoiceUpdate(BaseModel):
    is_paid: bool


class ProjectBase(BaseModel):
    name: str
    budget: Optional[float] = 0.0


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    id: int
    owner_id: int
    invoices: List[Invoice] = []
    documents: List[Document] = []  # Add documents to the Project schema

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    projects: List[Project] = []

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
