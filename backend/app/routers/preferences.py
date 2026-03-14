from fastapi import APIRouter
from app.schemas import PreferencesIn, PreferencesOut

router = APIRouter()


@router.get("/")
async def get_preferences_stub():
    """Temporary stub until DB-backed preference CRUD is added."""
    return {
        "message": "Preferences endpoint scaffolded.",
        "next": "POST/PUT user preferences and wire them to recommendation filters.",
    }


@router.post("/", response_model=PreferencesOut)
async def save_preferences(payload: PreferencesIn):
    """
    Save user preferences (temporary in-memory echo).
    DB persistence will be wired in the next step.
    """
    return PreferencesOut(**payload.model_dump(), saved=True)
