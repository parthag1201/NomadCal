from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def chat_status():
    """Temporary chat route placeholder for future AI itinerary refinement."""
    return {
        "chat": "not-implemented-yet",
        "purpose": "Refine yearly plan and regenerate itineraries conversationally.",
    }
