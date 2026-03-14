from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


# ──────────────────────────────────────────────────────────────────────────────
# Preferences
# ──────────────────────────────────────────────────────────────────────────────

class PreferencesIn(BaseModel):
    travel_style: Literal["adventure", "relaxation", "culture", "mixed"] = "mixed"
    budget_per_trip: int | None = Field(default=None, ge=1000)
    annual_budget: int | None = Field(default=None, ge=5000)
    group_type: Literal["solo", "couple", "family", "friends"] = "solo"
    activity_interests: list[str] = Field(default_factory=list)
    domestic_international: Literal["domestic", "international", "both"] = "both"
    comfort_level: Literal["backpacker", "mid-range", "luxury"] = "mid-range"


class PreferencesOut(PreferencesIn):
    saved: bool = True


# ──────────────────────────────────────────────────────────────────────────────
# Calendar / travel windows
# ──────────────────────────────────────────────────────────────────────────────

class TravelWindowQuery(BaseModel):
    year: int = Field(ge=2025, le=2035)
    leave_dates: list[date] = Field(default_factory=list)
    preferred_months: list[str] = Field(default_factory=list)
    blackout_dates: list[date] = Field(default_factory=list)


# ──────────────────────────────────────────────────────────────────────────────
# Trips
# ──────────────────────────────────────────────────────────────────────────────

class TripDraftIn(BaseModel):
    destination: str
    start_date: date
    end_date: date
    estimated_budget: int | None = Field(default=None, ge=0)
    notes: str | None = None


class TripDraftOut(TripDraftIn):
    id: str
    status: Literal["suggested", "confirmed", "completed"] = "suggested"
