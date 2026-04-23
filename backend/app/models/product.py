import uuid
from datetime import datetime
from sqlalchemy import String, Text, Numeric, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    condition: Mapped[str] = mapped_column(String(50), nullable=False)
    price_per_day: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    price_per_week: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    price_per_month: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    deposit_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    images: Mapped[list] = mapped_column(JSON, default=list)
    special_conditions: Mapped[str | None] = mapped_column(Text, nullable=True)
    rental_agreement: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="available")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="products", foreign_keys=[owner_id])
    rentals = relationship("Rental", back_populates="product")
    reviews = relationship("Review", back_populates="product")
    chats = relationship("Chat", back_populates="product")
