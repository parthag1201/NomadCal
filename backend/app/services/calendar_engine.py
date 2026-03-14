"""
Calendar Engine — NomadCal's core differentiator.

Given a user's leave dates and year, this engine:
1. Loads all Indian public holidays for that year
2. Detects every long weekend (consecutive off-days including Sat/Sun + holidays)
3. Merges the user's custom leave dates to extend those windows
4. Outputs a ranked list of "TravelWindow" objects — ready for the recommendation engine

TravelWindow example:
  {
    "label": "Holi Long Weekend",
    "start": "2026-03-27",
    "end":   "2026-03-30",
    "days":  4,
    "leaves_needed": 1,   ← user only needs to take 1 leave (Friday March 27)
    "type":  "long_weekend"
  }
"""

from __future__ import annotations

import json
from datetime import date, timedelta
from pathlib import Path
from typing import Literal


# ──────────────────────────────────────────────────────────────────────────────
# Data Structures
# ──────────────────────────────────────────────────────────────────────────────

WindowType = Literal["long_weekend", "custom_leave", "extended_leave"]


class TravelWindow:
    """A block of consecutive off-days suitable for a trip."""

    def __init__(
        self,
        label: str,
        start: date,
        end: date,
        leaves_needed: int,
        window_type: WindowType,
        anchored_holiday: str | None = None,
    ):
        self.label = label
        self.start = start
        self.end = end
        self.days = (end - start).days + 1
        self.leaves_needed = leaves_needed
        self.window_type = window_type
        self.anchored_holiday = anchored_holiday  # e.g. "Holi"

    def to_dict(self) -> dict:
        return {
            "label": self.label,
            "start": self.start.isoformat(),
            "end": self.end.isoformat(),
            "days": self.days,
            "leaves_needed": self.leaves_needed,
            "type": self.window_type,
            "anchored_holiday": self.anchored_holiday,
        }


# ──────────────────────────────────────────────────────────────────────────────
# Holiday Loader
# ──────────────────────────────────────────────────────────────────────────────

_SEEDS_DIR = Path(__file__).resolve().parents[3] / "data" / "seeds"


def load_holidays(year: int) -> dict[date, str]:
    """
    Load Indian public holidays for a given year from the seed JSON file.
    Returns a dict mapping date → holiday name.
    e.g. { date(2026, 3, 25): "Holi" }
    """
    filepath = _SEEDS_DIR / f"holidays_india_{year}.json"
    if not filepath.exists():
        return {}

    with open(filepath, encoding="utf-8") as f:
        raw: list[dict] = json.load(f)

    return {
        date.fromisoformat(entry["date"]): entry["name"]
        for entry in raw
    }


# ──────────────────────────────────────────────────────────────────────────────
# Core Engine
# ──────────────────────────────────────────────────────────────────────────────

def is_off_day(d: date, holidays: dict[date, str]) -> bool:
    """Return True if the day is a Saturday, Sunday, or public holiday."""
    return d.weekday() >= 5 or d in holidays  # weekday 5=Sat, 6=Sun


def get_off_streak(start: date, holidays: dict[date, str]) -> list[date]:
    """
    Starting from `start`, walk forward collecting consecutive off-days.
    Stops when a working day is hit.
    """
    streak: list[date] = []
    current = start
    while is_off_day(current, holidays):
        streak.append(current)
        current += timedelta(days=1)
    return streak


def detect_long_weekends(year: int, holidays: dict[date, str]) -> list[TravelWindow]:
    """
    Scan every day of the year and detect long weekends.

    A long weekend = any Sat/Sun/holiday cluster of 3+ consecutive days,
    OR a cluster that can be extended to 3+ days by taking 1 adjacent leave.

    Returns only unique windows, sorted by start date.
    """
    windows: list[TravelWindow] = []
    seen_starts: set[date] = set()

    jan1 = date(year, 1, 1)
    dec31 = date(year, 12, 31)
    current = jan1

    while current <= dec31:
        if is_off_day(current, holidays):
            streak = get_off_streak(current, holidays)
            streak_end = streak[-1]

            if len(streak) >= 3:
                # Already a long weekend without taking any leave
                label = _make_label(streak, holidays)
                if current not in seen_starts:
                    windows.append(TravelWindow(
                        label=label,
                        start=current,
                        end=streak_end,
                        leaves_needed=0,
                        window_type="long_weekend",
                        anchored_holiday=_find_holiday(streak, holidays),
                    ))
                    seen_starts.add(current)

            elif len(streak) == 2:
                # Sat-Sun only — check if adding a leave on Friday or Monday makes 3+ days
                friday = current - timedelta(days=1)
                monday = streak_end + timedelta(days=1)

                if not is_off_day(friday, holidays) and friday >= jan1:
                    # Take Friday off → Fri + Sat + Sun = 3 days
                    ext_start = friday
                    label = _make_label([friday] + streak, holidays)
                    if ext_start not in seen_starts:
                        windows.append(TravelWindow(
                            label=label,
                            start=ext_start,
                            end=streak_end,
                            leaves_needed=1,
                            window_type="long_weekend",
                            anchored_holiday=_find_holiday(streak, holidays),
                        ))
                        seen_starts.add(ext_start)

                if not is_off_day(monday, holidays) and monday <= dec31:
                    # Take Monday off → Sat + Sun + Mon = 3 days
                    ext_end = monday
                    label = _make_label(streak + [monday], holidays)
                    if current not in seen_starts:
                        windows.append(TravelWindow(
                            label=label,
                            start=current,
                            end=ext_end,
                            leaves_needed=1,
                            window_type="long_weekend",
                            anchored_holiday=_find_holiday(streak, holidays),
                        ))
                        seen_starts.add(current)

            # Jump past the streak to avoid double-counting
            current = streak_end + timedelta(days=1)
        else:
            current += timedelta(days=1)

    return sorted(windows, key=lambda w: w.start)


def _make_label(days: list[date], holidays: dict[date, str]) -> str:
    """Generate a human-friendly label for a travel window."""
    holiday_names = [holidays[d] for d in days if d in holidays]
    if holiday_names:
        return f"{holiday_names[0]} Weekend"
    month = days[0].strftime("%B")
    return f"{month} Long Weekend"


def _find_holiday(days: list[date], holidays: dict[date, str]) -> str | None:
    """Return the name of the first public holiday in the day list, if any."""
    for d in days:
        if d in holidays:
            return holidays[d]
    return None


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────

def get_travel_windows(
    year: int,
    leave_dates: list[str] | None = None,
    preferred_months: list[str] | None = None,
    blackout_dates: list[str] | None = None,
) -> list[dict]:
    """
    Main entry point — called by the /api/trips/windows endpoint.

    Args:
        year:             The year to plan for (e.g. 2026)
        leave_dates:      ISO date strings the user has marked as leave
        preferred_months: Month names the user prefers (e.g. ["march","october"])
        blackout_dates:   ISO date strings the user cannot travel

    Returns:
        List of TravelWindow dicts, filtered and sorted by start date.
    """
    holidays = load_holidays(year)
    leave_set: set[date] = {date.fromisoformat(d) for d in (leave_dates or [])}
    blackout_set: set[date] = {date.fromisoformat(d) for d in (blackout_dates or [])}

    # Merge user leaves into holiday map so they count as off-days
    for lv in leave_set:
        if lv not in holidays:
            holidays[lv] = "Leave"

    windows = detect_long_weekends(year, holidays)

    # Also collect extended multi-day leave blocks (if user took a whole week off)
    custom_blocks = _detect_custom_leave_blocks(leave_set, holidays)
    windows.extend(custom_blocks)

    # Filter out windows that overlap with blackout dates
    windows = [
        w for w in windows
        if not any(
            w.start <= bd <= w.end for bd in blackout_set
        )
    ]

    # Filter to preferred months if specified
    if preferred_months:
        months_lower = {m.lower() for m in preferred_months}
        windows = [
            w for w in windows
            if w.start.strftime("%B").lower() in months_lower
            or w.end.strftime("%B").lower() in months_lower
        ]

    return [w.to_dict() for w in sorted(windows, key=lambda w: w.start)]


def _detect_custom_leave_blocks(
    leave_set: set[date], holidays: dict[date, str]
) -> list[TravelWindow]:
    """
    Detect multi-day blocks formed purely from user leaves + weekends.
    (e.g., user takes Mon-Fri off → entire week becomes a 9-day window with flanking weekends)
    """
    if not leave_set:
        return []

    sorted_leaves = sorted(leave_set)
    blocks: list[TravelWindow] = []
    seen: set[date] = set()

    for lv in sorted_leaves:
        if lv in seen:
            continue

        # Expand backwards through adjacent off-days
        start = lv
        while is_off_day(start - timedelta(days=1), holidays):
            start -= timedelta(days=1)

        # Expand forward through adjacent off-days
        end = lv
        while is_off_day(end + timedelta(days=1), holidays):
            end += timedelta(days=1)

        if (end - start).days + 1 >= 4:  # only surface blocks of 4+ days
            day_range = [start + timedelta(days=i) for i in range((end - start).days + 1)]
            for d in day_range:
                seen.add(d)
            blocks.append(TravelWindow(
                label=f"Extended Leave Block ({start.strftime('%b %d')} – {end.strftime('%b %d')})",
                start=start,
                end=end,
                leaves_needed=sum(1 for d in day_range if d in leave_set),
                window_type="extended_leave",
            ))

    return blocks
