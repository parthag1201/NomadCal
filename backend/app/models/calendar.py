"""
UserCalendar model — stores the user's leave schedule for a given year.

This is paired with the Calendar Engine (services/calendar_engine.py) to
detect travel windows — long weekends, holiday clusters, and custom leaves.

Fields:
  - year              : which year this calendar is for (2026, 2027, etc.)
  - total_leaves      : total annual leaves available
  - leaves_used       : how many leaves allocated to trips so far
  - leave_dates       : JSON array of date strings the user is taking off
  - preferred_months  : months they'd prefer to travel (e.g., ["march", "october", "december"])
  - blackout_dates    : dates they absolutely can't travel
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, SmallInteger, String, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserCalendar(Base):
    __tablename__ = "user_calendars"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )

    year: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    total_leaves: Mapped[int] = mapped_column(Integer, default=20)
    leaves_used: Mapped[int] = mapped_column(Integer, default=0)
    leave_dates: Mapped[list[str] | None] = mapped_column(ARRAY(String))       # ["2026-03-27","2026-03-28"]
    preferred_months: Mapped[list[str] | None] = mapped_column(ARRAY(String))   # ["march","october"]
    blackout_dates: Mapped[list[str] | None] = mapped_column(ARRAY(String))     # dates user can't travel

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Back-reference to User
    user = relationship("User", back_populates="calendar")
