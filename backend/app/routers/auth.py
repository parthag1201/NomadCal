from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
async def auth_status():
    """Temporary auth status route until Google OAuth is implemented."""
    return {"auth": "not-configured", "provider": "google"}
