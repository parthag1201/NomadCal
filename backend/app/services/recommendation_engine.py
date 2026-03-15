"""
Lightweight recommendation engine (DB-independent).

This uses seed destination data + travel windows to suggest destinations
based on interests, budget, and preferred months.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.services.calendar_engine import get_travel_windows


_SEEDS_FILE = Path(__file__).resolve().parents[3] / "data" / "seeds" / "destinations.json"


def _load_destinations() -> list[dict[str, Any]]:
    if not _SEEDS_FILE.exists():
        return []
    with open(_SEEDS_FILE, encoding="utf-8") as f:
        return json.load(f)


def _score_destination(
    destination: dict[str, Any],
    interests: set[str],
    max_budget_per_day: int | None,
    preferred_months: set[str],
) -> float:
    score = 0.0

    activities = {a.lower() for a in destination.get("activities", [])}
    best_months = {m.lower() for m in destination.get("best_months", [])}
    tags = {t.lower() for t in destination.get("tags", [])}

    # Activity overlap (core signal)
    if interests:
        overlap = len(interests.intersection(activities))
        score += overlap * 3.0

    # Season match
    if preferred_months and best_months:
        season_overlap = len(preferred_months.intersection(best_months))
        score += season_overlap * 2.0

    # Budget fit
    cost = destination.get("avg_cost_per_day")
    if max_budget_per_day and isinstance(cost, int):
        if cost <= max_budget_per_day:
            score += 2.0
        else:
            # Soft penalty when over budget
            ratio = max_budget_per_day / max(cost, 1)
            score += max(0.0, ratio)

    # Slight nudge for budget-friendly destinations
    if "budget" in tags:
        score += 0.5

    return round(score, 2)


def suggest_destinations(
    year: int,
    preferred_months: list[str] | None = None,
    interests: list[str] | None = None,
    budget_per_trip: int | None = None,
    max_results: int = 8,
) -> dict[str, Any]:
    """
    Return ranked destination suggestions + relevant travel windows.

    budget_per_trip is converted to an approximate per-day budget using a 4-day window baseline.
    """
    preferred_months = preferred_months or []
    interests = interests or []

    windows = get_travel_windows(
        year=year,
        preferred_months=preferred_months,
    )

    destinations = _load_destinations()
    if not destinations:
        return {
            "year": year,
            "windows": windows,
            "suggestions": [],
            "message": "No destination seed data found.",
        }

    interests_set = {x.lower().strip() for x in interests if x.strip()}
    months_set = {x.lower().strip() for x in preferred_months if x.strip()}
    per_day_budget = int(budget_per_trip / 4) if budget_per_trip else None

    ranked = []
    for d in destinations:
        score = _score_destination(d, interests_set, per_day_budget, months_set)
        ranked.append({"score": score, **d})

    ranked.sort(key=lambda x: x["score"], reverse=True)
    top = ranked[:max_results]

    return {
        "year": year,
        "windows": windows,
        "suggestions": top,
        "inputs": {
            "preferred_months": preferred_months,
            "interests": interests,
            "budget_per_trip": budget_per_trip,
        },
    }
