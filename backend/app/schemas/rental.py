import uuid
from datetime import datetime, date
from pydantic import BaseModel
from typing import Optional
from .user import UserPublic
from .product import ProductOut


class RentalCreate(BaseModel):
    product_id: uuid.UUID
    start_date: date
    end_date: date
    rental_agreement_accepted: bool
    notes: Optional[str] = None


class RentalOut(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    renter_id: uuid.UUID
    owner_id: uuid.UUID
    start_date: date
    end_date: date
    status: str
    total_amount: float
    deposit_amount: float
    penalty_amount: float
    rental_agreement_accepted: bool
    id_proof_url: Optional[str] = None
    address_proof_url: Optional[str] = None
    notes: Optional[str] = None
    extension_requested: bool
    extended_end_date: Optional[date] = None
    product: Optional[ProductOut] = None
    renter: Optional[UserPublic] = None
    owner: Optional[UserPublic] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ExtensionRequest(BaseModel):
    new_end_date: date
