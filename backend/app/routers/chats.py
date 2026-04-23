import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.chat import Chat, Message
from ..models.product import Product
from ..schemas.chat import ChatOut, MessageOut
from ..utils.auth import get_current_user
from ..models.user import User

router = APIRouter(prefix="/api/chats", tags=["chats"])


@router.post("/start/{product_id}", response_model=ChatOut)
def start_chat(product_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot chat with yourself")

    existing = db.query(Chat).filter(
        Chat.product_id == product_id,
        Chat.renter_id == current_user.id,
    ).first()
    if existing:
        return _enrich_chat(existing, current_user.id, db)

    chat = Chat(product_id=product_id, renter_id=current_user.id, owner_id=product.owner_id)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return _enrich_chat(chat, current_user.id, db)


@router.get("", response_model=List[ChatOut])
def list_chats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chats = db.query(Chat).filter(
        (Chat.renter_id == current_user.id) | (Chat.owner_id == current_user.id)
    ).order_by(Chat.created_at.desc()).all()
    return [_enrich_chat(c, current_user.id, db) for c in chats]


@router.get("/{chat_id}/messages", response_model=List[MessageOut])
def get_messages(chat_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.renter_id != current_user.id and chat.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.query(Message).filter(
        Message.chat_id == chat_id,
        Message.sender_id != current_user.id,
        Message.is_read == False,
    ).update({"is_read": True})
    db.commit()

    return db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at.asc()).all()


@router.post("/{chat_id}/messages", response_model=MessageOut)
def send_message(
    chat_id: uuid.UUID,
    content: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.renter_id != current_user.id and chat.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    msg = Message(chat_id=chat_id, sender_id=current_user.id, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def _enrich_chat(chat: Chat, viewer_id: uuid.UUID, db: Session) -> dict:
    last_msg = db.query(Message).filter(Message.chat_id == chat.id).order_by(Message.created_at.desc()).first()
    unread = db.query(Message).filter(
        Message.chat_id == chat.id,
        Message.sender_id != viewer_id,
        Message.is_read == False,
    ).count()
    return {
        "id": chat.id,
        "product_id": chat.product_id,
        "renter_id": chat.renter_id,
        "owner_id": chat.owner_id,
        "created_at": chat.created_at,
        "renter": chat.renter,
        "owner": chat.owner,
        "last_message": last_msg.content if last_msg else None,
        "unread_count": unread,
    }
