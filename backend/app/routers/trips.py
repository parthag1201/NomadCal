from fastapi import APIRouter, Query

from app.schemas import TripDraftIn
from app.services.calendar_engine import get_travel_windows

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


@router.post("/draft")
async def create_trip_draft(payload: TripDraftIn):
    """
    Create a draft trip (temporary stub).
    This route will become DB-backed once Postgres migration is applied.
    """
    return {
        "id": "draft-001",
        "status": "suggested",
        **payload.model_dump(),
    }
