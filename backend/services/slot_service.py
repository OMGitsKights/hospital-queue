"""
Slot availability business logic.
"""
import logging

from models import store

logger = logging.getLogger(__name__)


def get_slot_availability(doctor_username: str, department: str,
                          date: str, hospital: str) -> dict:
    """
    Return unavailable slots and duration for the given context.
    Tries exact doctor match first, then falls back to department search.
    """
    slots_store = store.get_slots()
    unavailable = []
    duration = 30

    if doctor_username:
        raw = slots_store.get(doctor_username, {}).get(date, {})
        if isinstance(raw, list):
            unavailable = raw
        else:
            unavailable = raw.get("unavailable", [])
            duration = raw.get("duration", 30)
    elif department:
        users = store.get_users()
        candidates = [u for u, data in users.items()
                      if data.get("role") == "doctor" and data.get("department") == department]

        target = None
        for doc in candidates:
            doc_data = slots_store.get(doc, {}).get(date)
            if doc_data:
                saved_hospital = doc_data.get("hospital") if isinstance(doc_data, dict) else None
                if hospital and saved_hospital:
                    if saved_hospital == hospital:
                        target = doc
                        break
                else:
                    target = doc
                    break

        if not target and candidates:
            target = candidates[0]

        if target:
            raw = slots_store.get(target, {}).get(date, {})
            if isinstance(raw, list):
                unavailable = raw
            else:
                unavailable = raw.get("unavailable", [])
                duration = raw.get("duration", 30)

    return {"unavailable_slots": unavailable, "duration": duration}


def save_slot_availability(doctor_username: str, date: str,
                            unavailable: list, duration: int,
                            hospital: str, department: str, cfg) -> None:
    """Persist slot availability for a doctor."""
    if not date:
        raise ValueError("date is required")

    slots_store = store.get_slots()
    slots_store.setdefault(doctor_username, {})
    slots_store[doctor_username][date] = {
        "unavailable": unavailable,
        "duration": duration,
        "hospital": hospital,
        "department": department,
    }
    store.save_slots(cfg)
