import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.review import Review
from ..models.rental import Rental
from ..schemas.review import ReviewCreate, ReviewOut
from ..utils.auth import get_current_user
from ..models.user import User

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("", response_model=ReviewOut)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rental = db.query(Rental).filter(Rental.id == data.rental_id, Rental.status == "completed").first()
    if not rental:
        raise HTTPException(status_code=404, detail="Completed rental not found")

    if data.review_type == "product_owner":
        if rental.renter_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the renter can review the product/owner")
        reviewee_id = rental.owner_id
    elif data.review_type == "renter":
        if rental.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the owner can review the renter")
        reviewee_id = rental.renter_id
    else:
        raise HTTPException(status_code=400, detail="Invalid review_type")

    existing = db.query(Review).filter(
        Review.rental_id == data.rental_id,
        Review.reviewer_id == current_user.id,
        Review.review_type == data.review_type,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted this review")

    review = Review(
        product_id=rental.product_id,
        rental_id=data.rental_id,
        reviewer_id=current_user.id,
        reviewee_id=reviewee_id,
        rating=data.rating,
        comment=data.comment,
        review_type=data.review_type,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/product/{product_id}", response_model=List[ReviewOut])
def product_reviews(product_id: uuid.UUID, db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.product_id == product_id, Review.review_type == "product_owner")
        .order_by(Review.created_at.desc())
        .all()
    )


@router.get("/user/{user_id}", response_model=List[ReviewOut])
def user_reviews(user_id: uuid.UUID, db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.reviewee_id == user_id)
        .order_by(Review.created_at.desc())
        .all()
    )
