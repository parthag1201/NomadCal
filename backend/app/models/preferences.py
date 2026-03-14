"""
UserPreferences model — stores what kind of travel the user likes.

This is the core of NomadCal's personalization. Each user has ONE preferences record.

Fields:
  - travel_style           : "adventure", "relaxation", "culture", "mixed"
  - budget_per_trip        : max budget for a single trip (INR)
  - annual_budget          : total yearly travel budget (INR)
  - group_type             : "solo", "couple", "family", "friends"
  - activity_interests     : JSON array — ["trekking", "beach", "nightlife", "heritage", "food", "wildlife"]
  - domestic_international : "domestic", "international", "both"
  - comfort_level          : "backpacker", "mid-range", "luxury"
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )

    travel_style: Mapped[str] = mapped_column(String(20), default="mixed")
    budget_per_trip: Mapped[int | None] = mapped_column(Integer)        # INR
    annual_budget: Mapped[int | None] = mapped_column(Integer)          # INR
    group_type: Mapped[str] = mapped_column(String(20), default="solo")
    activity_interests: Mapped[list[str] | None] = mapped_column(ARRAY(String))  # PostgreSQL array
    domestic_international: Mapped[str] = mapped_column(String(20), default="both")
    comfort_level: Mapped[str] = mapped_column(String(20), default="mid-range")

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Back-reference to User
    user = relationship("User", back_populates="preferences")
