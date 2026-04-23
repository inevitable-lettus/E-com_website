import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class AddFunds(BaseModel):
    amount: float


class WalletTransactionOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    type: str
    amount: float
    description: str
    reference_id: Optional[str] = None
    balance_after: float
    created_at: datetime

    model_config = {"from_attributes": True}
