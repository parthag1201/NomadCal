from fastapi import APIRouter, Query
from pathlib import Path
import json
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from fastapi import HTTPException

from app.core.database import get_db
from app.models import Destination, Trip, User
from app.schemas import TripDraftIn
from app.services.calendar_engine import get_travel_windows
from app.services.recommendation_engine import suggest_destinations

router = APIRouter()


@router.get("/windows")
async def list_travel_windows(
    year: int = Query(..., description="Year to plan for, e.g. 2026"),
    preferred_months: list[str] | None = Query(default=None),
    leave_dates: list[str] | None = Query(default=None),
    blackout_dates: list[str] | None = Query(default=None),
):
    """
    Return travel windows detected from weekends, Indian holidays, and optional leave dates.

    Example:
      GET /api/trips/windows?year=2026&preferred_months=march&preferred_months=october
      GET /api/trips/windows?year=2026&leave_dates=2026-03-27&leave_dates=2026-03-28
    """
    windows = get_travel_windows(
        year=year,
        leave_dates=leave_dates,
        preferred_months=preferred_months,
        blackout_dates=blackout_dates,
    )
    return {"year": year, "count": len(windows), "windows": windows}


@router.get("/recommendations")
async def list_recommendations(
    year: int = Query(..., description="Year to plan for, e.g. 2026"),
    preferred_months: list[str] | None = Query(default=None),
    interests: list[str] | None = Query(default=None),
    budget_per_trip: int | None = Query(default=None),
    max_results: int = Query(default=8, ge=1, le=20),
):
    """
    Seed-data recommendations without DB dependency.
    Useful while infra is still being brought up.
    """
    return suggest_destinations(
        year=year,
        preferred_months=preferred_months,
        interests=interests,
        budget_per_trip=budget_per_trip,
        max_results=max_results,
    )


@router.post("/draft")
async def create_trip_draft(
    payload: TripDraftIn,
    user_email: str = Query(..., description="User email creating this trip draft"),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a draft trip (temporary stub).
    This route will become DB-backed once Postgres migration is applied.
    """
    try:
        user = await db.scalar(select(User).where(User.email == user_email))
        if not user:
            display_name = user_email.split("@")[0].replace(".", " ").title()
            user = User(email=user_email, name=display_name)
            db.add(user)
            await db.flush()

        destination = await db.scalar(select(Destination).where(Destination.name == payload.destination))
        duration_days = (payload.end_date - payload.start_date).days + 1
        title = f"{payload.destination} Trip ({payload.start_date.isoformat()} to {payload.end_date.isoformat()})"

        trip = Trip(
            user_id=user.id,
            destination_id=destination.id if destination else None,
            title=title,
            start_date=payload.start_date,
            end_date=payload.end_date,
            duration_days=duration_days,
            estimated_budget=payload.estimated_budget,
            status="suggested",
            notes=payload.notes,
            itinerary={
                "generated_at": datetime.utcnow().isoformat(),
                "summary": "Initial draft itinerary placeholder",
                "days": [],
            },
        )
        db.add(trip)
        await db.commit()
        await db.refresh(trip)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=503, detail="Database unavailable. Start PostgreSQL and retry.") from exc

    return {
        "id": str(trip.id),
        "status": trip.status,
        **payload.model_dump(),
    }


@router.post("/seed-destinations")
async def seed_destinations(db: AsyncSession = Depends(get_db)):
    """Load curated destination seed data into DB if not already present."""
    seeds_path = Path(__file__).resolve().parents[3] / "data" / "seeds" / "destinations.json"
    if not seeds_path.exists():
        return {"inserted": 0, "message": "destinations.json not found"}

    with open(seeds_path, encoding="utf-8") as f:
        destinations = json.load(f)

    try:
        inserted = 0
        for item in destinations:
            existing = await db.scalar(select(Destination).where(Destination.name == item["name"]))
            if existing:
                continue

            db.add(Destination(**item))
            inserted += 1

        await db.commit()
        return {"inserted": inserted, "total_in_file": len(destinations)}
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=503, detail="Database unavailable. Start PostgreSQL and retry.") from exc
