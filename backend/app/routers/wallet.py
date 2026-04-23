from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.wallet import WalletTransaction
from ..schemas.wallet import AddFunds, WalletTransactionOut
from ..utils.auth import get_current_user

router = APIRouter(prefix="/api/wallet", tags=["wallet"])


@router.get("/balance")
def get_balance(current_user: User = Depends(get_current_user)):
    return {"balance": float(current_user.wallet_balance)}


@router.post("/add-funds")
def add_funds(data: AddFunds, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.amount <= 0 or data.amount > 100000:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Amount must be between ₹1 and ₹1,00,000")
    current_user.wallet_balance = float(current_user.wallet_balance) + data.amount
    txn = WalletTransaction(
        user_id=current_user.id,
        type="credit",
        amount=data.amount,
        description="Funds added to wallet",
        reference_id="SIMULATED_TOPUP",
        balance_after=float(current_user.wallet_balance),
    )
    db.add(txn)
    db.commit()
    return {"balance": float(current_user.wallet_balance), "message": f"₹{data.amount:.2f} added successfully"}


@router.get("/transactions", response_model=List[WalletTransactionOut])
def get_transactions(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(WalletTransaction)
        .filter(WalletTransaction.user_id == current_user.id)
        .order_by(WalletTransaction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
