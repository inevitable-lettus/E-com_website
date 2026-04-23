import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from .user import UserPublic


class MessageOut(BaseModel):
    id: uuid.UUID
    chat_id: uuid.UUID
    sender_id: uuid.UUID
    content: str
    is_read: bool
    created_at: datetime
    sender: Optional[UserPublic] = None

    model_config = {"from_attributes": True}


class ChatOut(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    renter_id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    renter: Optional[UserPublic] = None
    owner: Optional[UserPublic] = None
    last_message: Optional[str] = None
    unread_count: int = 0

    model_config = {"from_attributes": True}
