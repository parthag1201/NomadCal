"""
NomadCal API — Entry point.

This is where FastAPI starts. It:
1. Creates the app instance
2. Configures CORS (so the React frontend can talk to the API)
3. Mounts all route modules (auth, preferences, trips, chat)
4. Exposes a health-check endpoint at GET /
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, chat, preferences, trips

app = FastAPI(
    title=settings.app_name,
    description="AI-powered yearly travel planner — personalized trips based on your preferences, calendar & budget.",
    version="0.1.0",
)

# CORS — allow the React frontend (localhost:5173 in dev) to call our API
# In production, replace with your actual domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # alternative dev port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- API Routers ---
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(preferences.router, prefix="/api/preferences", tags=["Preferences"])
app.include_router(trips.router, prefix="/api/trips", tags=["Trips"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])


@app.get("/", tags=["Health"])
async def health_check():
    """Simple health check — confirms the API is running."""
    return {"status": "healthy", "app": settings.app_name, "version": "0.1.0"}
