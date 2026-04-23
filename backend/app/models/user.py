import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    profile_pic: Mapped[str | None] = mapped_column(String(500), nullable=True)
    wallet_balance: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    id_proof_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    address_proof_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="owner", foreign_keys="Product.owner_id")
    rentals_as_renter = relationship("Rental", back_populates="renter", foreign_keys="Rental.renter_id")
    rentals_as_owner = relationship("Rental", back_populates="owner", foreign_keys="Rental.owner_id")
    wallet_transactions = relationship("WalletTransaction", back_populates="user")
    reviews_given = relationship("Review", back_populates="reviewer", foreign_keys="Review.reviewer_id")
    reviews_received = relationship("Review", back_populates="reviewee", foreign_keys="Review.reviewee_id")
