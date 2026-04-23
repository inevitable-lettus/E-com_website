import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from .database import engine, Base
from .models import User, Product, Rental, WalletTransaction, Chat, Message, Review
from .routers import auth, users, products, rentals, wallet, chats, reviews
from .config import settings

Base.metadata.create_all(bind=engine)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="Use(Less) API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(rentals.router)
app.include_router(wallet.router)
app.include_router(chats.router)
app.include_router(reviews.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "Use(Less) API"}


@app.on_event("startup")
def seed_database():
    from .utils.seed import seed
    from .database import SessionLocal
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
