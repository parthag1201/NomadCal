"""
Destination model — curated places you can travel to.

This is our knowledge base of destinations. Seeded from data/seeds/destinations.json
and enriched over time via scrapers and user contributions.

Fields:
  - name            : "Goa", "Manali", "Bali"
  - country/state   : location hierarchy
  - dest_type       : "beach", "mountain", "city", "desert", "forest", "island"
  - best_months     : when to visit (e.g., ["october","november","december"] for Goa)
  - avg_cost_per_day: approximate daily spend in INR (mid-range comfort)
  - activities      : things to do — ["snorkeling", "nightlife", "beach", "water-sports"]
  - tags            : searchable labels — ["romantic", "family-friendly", "budget", "offbeat"]
  - latitude/longitude: for map display and distance calculations
  - description     : short blurb about the destination
"""

import uuid

from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Destination(Base):
    __tablename__ = "destinations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    country: Mapped[str] = mapped_column(String(60), nullable=False, default="India")
    state: Mapped[str | None] = mapped_column(String(60))
    dest_type: Mapped[str] = mapped_column(String(30), nullable=False)          # beach, mountain, city, etc.
    best_months: Mapped[list[str] | None] = mapped_column(ARRAY(String))        # ["oct","nov","dec"]
    avg_cost_per_day: Mapped[int | None] = mapped_column(Integer)               # INR
    activities: Mapped[list[str] | None] = mapped_column(ARRAY(String))         # things to do
    tags: Mapped[list[str] | None] = mapped_column(ARRAY(String))               # searchable labels
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(500))                  # thumbnail for UI cards

    # Reverse relationship — find all trips to this destination
    trips = relationship("Trip", back_populates="destination")
