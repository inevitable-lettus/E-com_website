import uuid
from datetime import datetime, date
from sqlalchemy import String, Text, Numeric, DateTime, Date, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base


class Rental(Base):
    __tablename__ = "rentals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    renter_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    deposit_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    penalty_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    rental_agreement_accepted: Mapped[bool] = mapped_column(Boolean, default=False)
    id_proof_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    address_proof_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    extension_requested: Mapped[bool] = mapped_column(Boolean, default=False)
    extended_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="rentals")
    renter = relationship("User", back_populates="rentals_as_renter", foreign_keys=[renter_id])
    owner = relationship("User", back_populates="rentals_as_owner", foreign_keys=[owner_id])
    review = relationship("Review", back_populates="rental", uselist=False)
