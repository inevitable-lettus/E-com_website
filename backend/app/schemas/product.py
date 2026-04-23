import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from .user import UserPublic


class ProductCreate(BaseModel):
    title: str
    description: str
    category: str
    condition: str
    price_per_day: Optional[float] = None
    price_per_week: Optional[float] = None
    price_per_month: Optional[float] = None
    deposit_amount: float = 0.0
    images: List[str] = []
    special_conditions: Optional[str] = None
    rental_agreement: Optional[str] = None


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    price_per_day: Optional[float] = None
    price_per_week: Optional[float] = None
    price_per_month: Optional[float] = None
    deposit_amount: Optional[float] = None
    images: Optional[List[str]] = None
    special_conditions: Optional[str] = None
    rental_agreement: Optional[str] = None
    status: Optional[str] = None


class ProductOut(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    title: str
    description: str
    category: str
    condition: str
    price_per_day: Optional[float] = None
    price_per_week: Optional[float] = None
    price_per_month: Optional[float] = None
    deposit_amount: float
    images: List[str]
    special_conditions: Optional[str] = None
    rental_agreement: Optional[str] = None
    status: str
    owner: UserPublic
    avg_rating: Optional[float] = None
    review_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}
