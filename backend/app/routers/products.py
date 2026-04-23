import os
import uuid
import aiofiles
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from ..database import get_db
from ..models.product import Product
from ..models.review import Review
from ..schemas.product import ProductCreate, ProductUpdate, ProductOut
from ..utils.auth import get_current_user, get_optional_user
from ..models.user import User
from ..config import settings

router = APIRouter(prefix="/api/products", tags=["products"])

CATEGORIES = ["Electronics", "Furniture", "Kitchen", "Tools", "Sports", "Outdoor", "Clothing", "Other"]
CONDITIONS = ["Excellent", "Good", "Fair", "Poor"]


def enrich_product(product: Product, db: Session) -> dict:
    result = {c.name: getattr(product, c.name) for c in product.__table__.columns}
    result["owner"] = product.owner
    avg = db.query(func.avg(Review.rating)).filter(
        Review.product_id == product.id,
        Review.review_type == "product_owner"
    ).scalar()
    count = db.query(func.count(Review.id)).filter(
        Review.product_id == product.id,
        Review.review_type == "product_owner"
    ).scalar()
    result["avg_rating"] = round(float(avg), 1) if avg else None
    result["review_count"] = count or 0
    return result


@router.get("/categories")
def get_categories():
    return CATEGORIES


@router.get("", response_model=List[ProductOut])
def list_products(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    skip: int = 0,
    limit: int = 24,
    db: Session = Depends(get_db),
):
    q = db.query(Product).filter(Product.status == "available")
    if search:
        q = q.filter(or_(
            Product.title.ilike(f"%{search}%"),
            Product.description.ilike(f"%{search}%"),
        ))
    if category:
        q = q.filter(Product.category == category)
    if condition:
        q = q.filter(Product.condition == condition)
    if min_price is not None:
        q = q.filter(Product.price_per_day >= min_price)
    if max_price is not None:
        q = q.filter(Product.price_per_day <= max_price)

    products = q.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()
    return [enrich_product(p, db) for p in products]


@router.get("/my", response_model=List[ProductOut])
def my_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    products = db.query(Product).filter(Product.owner_id == current_user.id).order_by(Product.created_at.desc()).all()
    return [enrich_product(p, db) for p in products]


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return enrich_product(product, db)


@router.post("", response_model=ProductOut)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.category not in CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")
    if data.condition not in CONDITIONS:
        raise HTTPException(status_code=400, detail="Invalid condition")
    if not any([data.price_per_day, data.price_per_week, data.price_per_month]):
        raise HTTPException(status_code=400, detail="At least one pricing option required")

    product = Product(**data.model_dump(), owner_id=current_user.id)
    db.add(product)
    db.commit()
    db.refresh(product)
    return enrich_product(product, db)


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: uuid.UUID,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id, Product.owner_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not owned by you")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return enrich_product(product, db)


@router.delete("/{product_id}")
def delete_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id, Product.owner_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not owned by you")
    product.status = "unavailable"
    db.commit()
    return {"message": "Product removed from listings"}


@router.post("/{product_id}/upload-image")
async def upload_image(
    product_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id, Product.owner_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not owned by you")

    filename = f"product_{product_id}_{uuid.uuid4().hex}{os.path.splitext(file.filename)[1]}"
    path = os.path.join(settings.UPLOAD_DIR, filename)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    async with aiofiles.open(path, "wb") as f:
        await f.write(await file.read())

    url = f"/uploads/{filename}"
    images = list(product.images or [])
    images.append(url)
    product.images = images
    db.commit()
    return {"url": url}
