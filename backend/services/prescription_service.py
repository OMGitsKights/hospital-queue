"""
Prescription business logic.
"""
import logging
import uuid

from models import store

logger = logging.getLogger(__name__)


def add_prescription(data: dict, doctor_username: str, cfg) -> dict:
    """
    Save a prescription record for a patient.
    Raises ValueError on missing required fields.
    """
    patient_username = data.get("patient_username")
    if not patient_username:
        raise ValueError("patient_username is required")

    medications = data.get("medications")
    text = data.get("text")
    if not medications and not text:
        raise ValueError("Either medications list or text is required")

    record = {
        "id": uuid.uuid4().hex,
        "medications": medications or None,
        "text": text or None,
        "notes": data.get("notes") or None,
        "reference": data.get("reference"),
        "hospital": data.get("hospital"),
        "department": data.get("department"),
        "slot": data.get("slot"),
        "doctor": doctor_username,
    }

    prescriptions = store.get_prescriptions()
    prescriptions.setdefault(patient_username, [])
    prescriptions[patient_username].append(record)
    store.save_prescriptions(cfg)

    return record


def get_prescriptions_for_patient(patient_username: str) -> list:
    """Return all prescriptions for the given patient."""
    return store.get_prescriptions().get(patient_username, [])
