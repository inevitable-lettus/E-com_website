import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    google_id: Optional[str] = None
    profile_pic: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    profile_pic: Optional[str] = None


class UserOut(UserBase):
    id: uuid.UUID
    profile_pic: Optional[str] = None
    wallet_balance: float
    id_proof_url: Optional[str] = None
    address_proof_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserPublic(BaseModel):
    id: uuid.UUID
    name: str
    profile_pic: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
