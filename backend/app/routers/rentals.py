import uuid
from datetime import date, datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.rental import Rental
from ..models.product import Product
from ..models.user import User
from ..models.wallet import WalletTransaction
from ..schemas.rental import RentalCreate, RentalOut, ExtensionRequest
from ..utils.auth import get_current_user
from ..config import settings

router = APIRouter(prefix="/api/rentals", tags=["rentals"])


def calculate_amount(product: Product, start: date, end: date) -> float:
    days = (end - start).days
    if days <= 0:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    if product.price_per_month and days >= 28:
        months = days / 30
        return round(float(product.price_per_month) * months, 2)
    if product.price_per_week and days >= 7:
        weeks = days / 7
        return round(float(product.price_per_week) * weeks, 2)
    if product.price_per_day:
        return round(float(product.price_per_day) * days, 2)
    raise HTTPException(status_code=400, detail="Product has no valid pricing for this duration")


def debit_wallet(user: User, amount: float, description: str, ref: str, db: Session):
    if float(user.wallet_balance) < amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    user.wallet_balance = float(user.wallet_balance) - amount
    txn = WalletTransaction(
        user_id=user.id, type="debit", amount=amount,
        description=description, reference_id=ref,
        balance_after=float(user.wallet_balance),
    )
    db.add(txn)


def credit_wallet(user: User, amount: float, description: str, ref: str, db: Session):
    user.wallet_balance = float(user.wallet_balance) + amount
    txn = WalletTransaction(
        user_id=user.id, type="credit", amount=amount,
        description=description, reference_id=ref,
        balance_after=float(user.wallet_balance),
    )
    db.add(txn)


@router.post("", response_model=RentalOut)
def create_rental(
    data: RentalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == data.product_id, Product.status == "available").first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not available")
    if product.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot rent your own product")
    if not data.rental_agreement_accepted:
        raise HTTPException(status_code=400, detail="Rental agreement must be accepted")

    total = calculate_amount(product, data.start_date, data.end_date)
    deposit = float(product.deposit_amount)
    total_charge = total + deposit

    debit_wallet(current_user, total_charge, f"Rental payment for '{product.title}'", str(data.product_id), db)

    rental = Rental(
        product_id=data.product_id,
        renter_id=current_user.id,
        owner_id=product.owner_id,
        start_date=data.start_date,
        end_date=data.end_date,
        status="pending",
        total_amount=total,
        deposit_amount=deposit,
        rental_agreement_accepted=data.rental_agreement_accepted,
        notes=data.notes,
    )
    product.status = "rented"
    db.add(rental)
    db.commit()
    db.refresh(rental)
    return rental


@router.get("/my-rentals", response_model=List[RentalOut])
def my_rentals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rentals = db.query(Rental).filter(Rental.renter_id == current_user.id).order_by(Rental.created_at.desc()).all()
    _apply_penalties(rentals, db)
    return rentals


@router.get("/owner-rentals", response_model=List[RentalOut])
def owner_rentals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rentals = db.query(Rental).filter(Rental.owner_id == current_user.id).order_by(Rental.created_at.desc()).all()
    _apply_penalties(rentals, db)
    return rentals


@router.get("/{rental_id}", response_model=RentalOut)
def get_rental(rental_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    if rental.renter_id != current_user.id and rental.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return rental


@router.put("/{rental_id}/approve")
def approve_rental(rental_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rental = db.query(Rental).filter(Rental.id == rental_id, Rental.owner_id == current_user.id, Rental.status == "pending").first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found or not pending")
    rental.status = "active"
    # Pay owner (minus deposit which is held)
    owner = db.query(User).filter(User.id == current_user.id).first()
    credit_wallet(owner, float(rental.total_amount), f"Rental income for '{rental.product.title}'", str(rental.id), db)
    db.commit()
    return {"message": "Rental approved"}


@router.put("/{rental_id}/reject")
def reject_rental(rental_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rental = db.query(Rental).filter(Rental.id == rental_id, Rental.owner_id == current_user.id, Rental.status == "pending").first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found or not pending")
    rental.status = "cancelled"
    rental.product.status = "available"
    # Refund renter
    renter = db.query(User).filter(User.id == rental.renter_id).first()
    credit_wallet(renter, float(rental.total_amount) + float(rental.deposit_amount),
                  f"Refund for rejected rental of '{rental.product.title}'", str(rental.id), db)
    db.commit()
    return {"message": "Rental rejected and renter refunded"}


@router.put("/{rental_id}/return")
def return_product(rental_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rental = db.query(Rental).filter(Rental.id == rental_id, Rental.owner_id == current_user.id, Rental.status == "active").first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found or not active")

    today = date.today()
    end = rental.extended_end_date or rental.end_date
    penalty = 0.0
    if today > end:
        overdue_days = (today - end).days
        penalty = overdue_days * settings.PENALTY_PER_DAY
        renter = db.query(User).filter(User.id == rental.renter_id).first()
        if penalty > 0:
            debit_wallet(renter, min(penalty, float(renter.wallet_balance)),
                         f"Late return penalty for '{rental.product.title}'", str(rental.id), db)
            credit_wallet(current_user, penalty, f"Late return penalty received", str(rental.id), db)
        rental.penalty_amount = penalty

    # Return deposit to renter
    renter = db.query(User).filter(User.id == rental.renter_id).first()
    credit_wallet(renter, float(rental.deposit_amount), f"Security deposit returned for '{rental.product.title}'", str(rental.id), db)

    rental.status = "completed"
    rental.product.status = "available"
    db.commit()
    return {"message": "Return confirmed", "penalty": penalty}


@router.post("/{rental_id}/request-extension")
def request_extension(
    rental_id: uuid.UUID,
    data: ExtensionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rental = db.query(Rental).filter(Rental.id == rental_id, Rental.renter_id == current_user.id, Rental.status == "active").first()
    if not rental:
        raise HTTPException(status_code=404, detail="Active rental not found")
    end = rental.extended_end_date or rental.end_date
    if data.new_end_date <= end:
        raise HTTPException(status_code=400, detail="New end date must be after current end date")
    rental.extension_requested = True
    rental.extended_end_date = data.new_end_date
    db.commit()
    return {"message": "Extension requested, waiting for owner approval"}


@router.put("/{rental_id}/approve-extension")
def approve_extension(rental_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rental = db.query(Rental).filter(Rental.id == rental_id, Rental.owner_id == current_user.id,
                                      Rental.extension_requested == True).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Extension request not found")

    extra_days = (rental.extended_end_date - rental.end_date).days
    extra_amount = 0.0
    if rental.product.price_per_day:
        extra_amount = float(rental.product.price_per_day) * extra_days

    renter = db.query(User).filter(User.id == rental.renter_id).first()
    if extra_amount > 0:
        debit_wallet(renter, extra_amount, f"Extension payment for '{rental.product.title}'", str(rental.id), db)
        credit_wallet(current_user, extra_amount, f"Extension income for '{rental.product.title}'", str(rental.id), db)

    rental.end_date = rental.extended_end_date
    rental.extended_end_date = None
    rental.extension_requested = False
    rental.total_amount = float(rental.total_amount) + extra_amount
    db.commit()
    return {"message": "Extension approved"}


def _apply_penalties(rentals, db):
    today = date.today()
    changed = False
    for r in rentals:
        if r.status == "active":
            end = r.extended_end_date or r.end_date
            if today > end and r.status != "overdue":
                r.status = "overdue"
                changed = True
    if changed:
        db.commit()
