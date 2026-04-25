"""
Ratings business logic.
"""
import logging
import uuid
from datetime import datetime

from models import store

logger = logging.getLogger(__name__)


def add_rating(data: dict, patient_username: str, cfg) -> dict:
    """
    Save a patient rating.
    Raises ValueError on missing fields or invalid scores.
    """
    required = ["hospital", "department", "doctor_rating", "hospital_rating"]
    missing = [f for f in required if data.get(f) is None]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")

    doctor_rating = int(data["doctor_rating"])
    hospital_rating = int(data["hospital_rating"])

    if not (1 <= doctor_rating <= 5) or not (1 <= hospital_rating <= 5):
        raise ValueError("Ratings must be between 1 and 5")

    record = {
        "id": uuid.uuid4().hex,
        "hospital": data["hospital"],
        "department": data["department"],
        "doctor_rating": doctor_rating,
        "hospital_rating": hospital_rating,
        "remarks": data.get("remarks", ""),
        "booking_id": data.get("booking_id"),
        "patient_username": patient_username,
        "timestamp": datetime.now().isoformat(),
    }

    store.get_ratings().append(record)
    store.save_ratings(cfg)
    return record


def get_ratings(hospital: str = None, department: str = None) -> dict:
    """Return filtered ratings with computed averages."""
    all_ratings = store.get_ratings()

    filtered = [r for r in all_ratings
                if (not hospital or r.get("hospital") == hospital)
                and (not department or r.get("department") == department)]

    if not filtered:
        return {"average_doctor": 0, "average_hospital": 0,
                "count": 0, "reviews": []}

    avg_doc = sum(r["doctor_rating"] for r in filtered) / len(filtered)
    avg_hosp = sum(r["hospital_rating"] for r in filtered) / len(filtered)

    return {
        "average_doctor": round(avg_doc, 1),
        "average_hospital": round(avg_hosp, 1),
        "count": len(filtered),
        "reviews": filtered,
    }
