import uuid
from datetime import datetime
from pydantic import BaseModel, field_validator
from typing import Optional
from .user import UserPublic


class ReviewCreate(BaseModel):
    rental_id: uuid.UUID
    rating: int
    comment: Optional[str] = None
    review_type: str  # product_owner / renter

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewOut(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    rental_id: uuid.UUID
    reviewer_id: uuid.UUID
    reviewee_id: uuid.UUID
    rating: int
    comment: Optional[str] = None
    review_type: str
    reviewer: Optional[UserPublic] = None
    created_at: datetime

    model_config = {"from_attributes": True}
