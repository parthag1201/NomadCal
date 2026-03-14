from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import User, UserPreferences
from app.schemas import PreferencesIn, PreferencesOut

router = APIRouter()


@router.get("/")
async def get_preferences(
    user_email: str = Query(..., description="User email to fetch preferences for"),
    db: AsyncSession = Depends(get_db),
):
    """Get saved preferences for a user by email."""
    try:
        user = await db.scalar(select(User).where(User.email == user_email))
        if not user:
            return {"exists": False, "message": "User not found"}

        prefs = await db.scalar(select(UserPreferences).where(UserPreferences.user_id == user.id))
        if not prefs:
            return {"exists": False, "message": "Preferences not found"}

        return {
            "exists": True,
            "preferences": {
                "travel_style": prefs.travel_style,
                "budget_per_trip": prefs.budget_per_trip,
                "annual_budget": prefs.annual_budget,
                "group_type": prefs.group_type,
                "activity_interests": prefs.activity_interests or [],
                "domestic_international": prefs.domestic_international,
                "comfort_level": prefs.comfort_level,
            },
        }
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database unavailable. Start PostgreSQL and retry.") from exc


@router.post("/", response_model=PreferencesOut)
async def save_preferences(
    payload: PreferencesIn,
    user_email: str = Query(..., description="User email to save preferences for"),
    db: AsyncSession = Depends(get_db),
):
    """Create or update preferences for a user (upsert by user email)."""
    try:
        user = await db.scalar(select(User).where(User.email == user_email))
        if not user:
            # Minimal user bootstrap until auth is fully integrated.
            display_name = user_email.split("@")[0].replace(".", " ").title()
            user = User(email=user_email, name=display_name)
            db.add(user)
            await db.flush()

        prefs = await db.scalar(select(UserPreferences).where(UserPreferences.user_id == user.id))
        if not prefs:
            prefs = UserPreferences(user_id=user.id)
            db.add(prefs)

        prefs.travel_style = payload.travel_style
        prefs.budget_per_trip = payload.budget_per_trip
        prefs.annual_budget = payload.annual_budget
        prefs.group_type = payload.group_type
        prefs.activity_interests = payload.activity_interests
        prefs.domestic_international = payload.domestic_international
        prefs.comfort_level = payload.comfort_level

        await db.commit()
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=503, detail="Database unavailable. Start PostgreSQL and retry.") from exc

    return PreferencesOut(**payload.model_dump(), saved=True)
