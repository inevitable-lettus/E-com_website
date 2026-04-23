from sqlalchemy.orm import Session
from ..models.user import User
from ..models.product import Product
from ..models.rental import Rental
from ..models.review import Review
from ..models.wallet import WalletTransaction
from datetime import date, datetime, timedelta
import uuid

SAMPLE_IMAGES = {
    "Electronics": [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600",
    ],
    "Kitchen": [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
        "https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=600",
    ],
    "Tools": [
        "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600",
    ],
    "Sports": [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    ],
    "Outdoor": [
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600",
    ],
    "Furniture": [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
    ],
}

PRODUCTS = [
    {
        "title": "Canon EOS 80D DSLR Camera",
        "description": "Professional DSLR camera with 18-55mm kit lens. Perfect for events, weddings, or travel photography. Comes with memory card and camera bag.",
        "category": "Electronics",
        "condition": "Excellent",
        "price_per_day": 350.0,
        "price_per_week": 1800.0,
        "deposit_amount": 5000.0,
        "special_conditions": "Please handle with care. No modification to settings. Return with all accessories.",
    },
    {
        "title": "Philips Air Fryer XXL (6.2L)",
        "description": "Large capacity air fryer, great for parties or big families. Can cook up to 1.4kg of fries at once. Barely used.",
        "category": "Kitchen",
        "condition": "Excellent",
        "price_per_day": 150.0,
        "price_per_week": 700.0,
        "deposit_amount": 1000.0,
    },
    {
        "title": "Coleman 4-Person Camping Tent",
        "description": "Waterproof family camping tent with easy setup. Includes carrying bag, rain fly, and ground sheet. Used for 2 trips only.",
        "category": "Outdoor",
        "condition": "Good",
        "price_per_day": 200.0,
        "price_per_week": 1000.0,
        "price_per_month": 3000.0,
        "deposit_amount": 1500.0,
    },
    {
        "title": "Bosch Professional Power Drill Set",
        "description": "Heavy-duty corded drill set with 20+ drill bits, screwdriver heads, and carrying case. Perfect for home renovation projects.",
        "category": "Tools",
        "condition": "Good",
        "price_per_day": 120.0,
        "price_per_week": 600.0,
        "deposit_amount": 800.0,
        "special_conditions": "Return all accessories. Damage beyond normal wear will be charged.",
    },
    {
        "title": "KitchenAid Stand Mixer (5Qt)",
        "description": "Iconic red KitchenAid stand mixer, 10-speed settings, comes with dough hook, whisk, and flat beater. Ideal for baking enthusiasts.",
        "category": "Kitchen",
        "condition": "Excellent",
        "price_per_day": 250.0,
        "price_per_week": 1200.0,
        "deposit_amount": 3000.0,
    },
    {
        "title": "Anker Nebula Capsule Portable Projector",
        "description": "Smart mini projector, 100 ANSI lumens, Android OS, Wi-Fi and Bluetooth. Projects up to 100 inch image. Great for movie nights or presentations.",
        "category": "Electronics",
        "condition": "Excellent",
        "price_per_day": 300.0,
        "price_per_week": 1500.0,
        "deposit_amount": 4000.0,
    },
    {
        "title": "Trek Marlin 7 Mountain Bicycle",
        "description": "29-inch hardtail mountain bike, 21-speed Shimano gears, hydraulic disc brakes. Suitable for trails and city commuting. Helmet available on request.",
        "category": "Sports",
        "condition": "Good",
        "price_per_day": 180.0,
        "price_per_week": 900.0,
        "price_per_month": 2800.0,
        "deposit_amount": 2000.0,
    },
    {
        "title": "Prestige 10L Pressure Cooker",
        "description": "Large stainless steel pressure cooker, ideal for big batches, dal, biryani, or canning. Comes with spare gaskets.",
        "category": "Kitchen",
        "condition": "Good",
        "price_per_day": 80.0,
        "price_per_week": 400.0,
        "deposit_amount": 500.0,
    },
    {
        "title": "Sony WH-1000XM4 Noise Cancelling Headphones",
        "description": "Industry-leading noise cancellation headphones with 30hr battery life. Perfect for travel or focused work sessions.",
        "category": "Electronics",
        "condition": "Excellent",
        "price_per_day": 200.0,
        "price_per_week": 900.0,
        "deposit_amount": 3000.0,
    },
    {
        "title": "IKEA Foldable Study Desk",
        "description": "Clean white foldable desk, 120x60cm surface, easy assembly. Great for temporary home office setup or guests.",
        "category": "Furniture",
        "condition": "Good",
        "price_per_week": 400.0,
        "price_per_month": 1200.0,
        "deposit_amount": 500.0,
    },
]

USERS = [
    {"name": "Priya Sharma", "email": "priya.sharma@example.com"},
    {"name": "Rahul Verma", "email": "rahul.verma@example.com"},
    {"name": "Anita Nair", "email": "anita.nair@example.com"},
]


def seed(db: Session):
    if db.query(User).count() > 0:
        return  # Already seeded

    users = []
    for u in USERS:
        user = User(name=u["name"], email=u["email"], wallet_balance=2000.0)
        db.add(user)
        users.append(user)
    db.flush()

    for i, p in enumerate(PRODUCTS):
        owner = users[i % len(users)]
        images = SAMPLE_IMAGES.get(p["category"], [])
        product = Product(
            owner_id=owner.id,
            images=images,
            **{k: v for k, v in p.items() if k not in ("images",)},
        )
        db.add(product)
    db.flush()

    # One sample completed rental with review
    product = db.query(Product).first()
    renter = users[1]
    owner = users[0]
    rental = Rental(
        product_id=product.id,
        renter_id=renter.id,
        owner_id=owner.id,
        start_date=date.today() - timedelta(days=14),
        end_date=date.today() - timedelta(days=7),
        status="completed",
        total_amount=2450.0,
        deposit_amount=float(product.deposit_amount),
        rental_agreement_accepted=True,
    )
    db.add(rental)
    db.flush()

    review = Review(
        product_id=product.id,
        rental_id=rental.id,
        reviewer_id=renter.id,
        reviewee_id=owner.id,
        rating=5,
        comment="Absolutely fantastic experience! The camera was in perfect condition and the owner was very helpful.",
        review_type="product_owner",
    )
    db.add(review)
    db.commit()
    print("Database seeded with sample data.")
