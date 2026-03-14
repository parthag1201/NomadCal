"""
User model — stores account info for each NomadCal user.

Fields:
  - id            : unique identifier (UUID, not auto-increment — better for distributed systems)
  - email         : login email (unique)
  - name          : display name
  - home_city     : where the user lives (used to calculate travel routes & nearby airports)
  - auth_provider : how they signed up ("google", "email")
  - created_at    : when the account was created
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    home_city: Mapped[str | None] = mapped_column(String(100))
    auth_provider: Mapped[str] = mapped_column(String(20), default="google")
    hashed_password: Mapped[str | None] = mapped_column(String(255))  # null for OAuth users
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships — SQLAlchemy auto-joins these when you access user.preferences
    preferences = relationship("UserPreferences", back_populates="user", uselist=False)
    calendar = relationship("UserCalendar", back_populates="user")
    trips = relationship("Trip", back_populates="user")
