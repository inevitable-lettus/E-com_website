import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserOut, UserUpdate, UserPublic
from ..utils.auth import get_current_user
from ..config import settings

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/upload-id-proof", response_model=UserOut)
async def upload_id_proof(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filename = f"id_{current_user.id}_{uuid.uuid4().hex}{os.path.splitext(file.filename)[1]}"
    path = os.path.join(settings.UPLOAD_DIR, filename)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    async with aiofiles.open(path, "wb") as f:
        await f.write(await file.read())
    current_user.id_proof_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/upload-address-proof", response_model=UserOut)
async def upload_address_proof(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filename = f"addr_{current_user.id}_{uuid.uuid4().hex}{os.path.splitext(file.filename)[1]}"
    path = os.path.join(settings.UPLOAD_DIR, filename)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    async with aiofiles.open(path, "wb") as f:
        await f.write(await file.read())
    current_user.address_proof_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=UserPublic)
def get_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
