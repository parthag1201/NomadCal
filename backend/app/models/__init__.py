"""
Import all models here so SQLAlchemy registers them.
Alembic and the app both import from this file to discover all tables.
"""

from app.models.user import User
from app.models.preferences import UserPreferences
from app.models.calendar import UserCalendar
from app.models.trip import Trip
from app.models.destination import Destination

__all__ = ["User", "UserPreferences", "UserCalendar", "Trip", "Destination"]
