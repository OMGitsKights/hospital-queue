"""
Appointment / queue business logic.
"""
import logging
import uuid

from models import store
from utils.triage import is_emergency

logger = logging.getLogger(__name__)


def book_appointment(data: dict, patient_username: str) -> dict:
    """
    Add a patient to the queue.
    Returns a dict with patient_id and reference_number.
    Raises ValueError on invalid / missing fields.
    """
    required = ["name", "hospital", "department", "shift", "date", "slot"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")

    hospital = data["hospital"]
    date = data["date"]
    dept = data["department"]
    shift = data["shift"]

    patients_queue = store.get_patients_queue()
    queues = store.get_queues()

    patients_queue.setdefault(hospital, {})
    patients_queue[hospital].setdefault(date, {})
    patients_queue[hospital][date].setdefault(dept, [])

    patient_id = str(uuid.uuid4())
    doctor_username = data.get("doctor_username")
    users = store.get_users()

    patient_record = {
        "id": patient_id,
        "name": data["name"],
        "shift": shift,
        "slot": data["slot"],
        "status": "waiting",
        "patient_username": patient_username,
        "symptoms": data.get("symptoms", ""),
        "is_emergency": is_emergency(data.get("symptoms", "")),
        "sex": data.get("sex"),
        "age": data.get("age"),
        "doctor_username": doctor_username,
        "doctor_name": users.get(doctor_username, {}).get("name") if doctor_username else None,
    }
    reference = data.get("reference")
    if reference:
        patient_record["reference"] = reference

    patients_queue[hospital][date][dept].append(patient_record)

    # Update rolling count
    queues.setdefault(hospital, {})
    queues[hospital].setdefault(date, {})
    queues[hospital][date].setdefault(dept, {"morning": 0, "afternoon": 0})
    queues[hospital][date][dept][shift] += 1

    return {"success": True, "patient_id": patient_id, "reference_number": reference or patient_id}


def get_my_bookings(patient_username: str) -> list:
    """Return all bookings for a given patient."""
    result = []
    for hospital, dates in store.get_patients_queue().items():
        for date, depts in dates.items():
            for dept, patients in depts.items():
                for patient in patients:
                    if patient.get("patient_username") == patient_username:
                        p = dict(patient)
                        p["hospital"] = hospital
                        p["date"] = date
                        p["department"] = dept
                        result.append(p)
    return result


def get_queue_counts(date_filter: str = None) -> dict:
    """Return queue counts, optionally filtered by date."""
    queues = store.get_queues()
    if not date_filter:
        return queues
    result = {}
    for hospital, dates in queues.items():
        if date_filter in dates:
            result[hospital] = dates[date_filter]
    return result


def get_patients_for_doctor(doctor_user: dict, date_filter: str,
                            hospital_filter: str) -> dict:
    """Return morning/afternoon patient lists for a doctor's department."""
    dept = doctor_user.get("department", "General")
    result = {"morning": [], "afternoon": []}

    for hospital, dates in store.get_patients_queue().items():
        if hospital_filter and hospital != hospital_filter:
            continue
        for date, depts in dates.items():
            if date_filter and date != date_filter:
                continue
            for patient in depts.get(dept, []):
                if patient["status"] == "done":
                    continue
                enriched = dict(patient)
                enriched["hospital"] = hospital
                enriched["date"] = date
                enriched["department"] = dept
                if patient["shift"] == "morning":
                    result["morning"].append(enriched)
                else:
                    result["afternoon"].append(enriched)

    # Emergency patients first
    result["morning"].sort(key=lambda x: x.get("is_emergency", False), reverse=True)
    result["afternoon"].sort(key=lambda x: x.get("is_emergency", False), reverse=True)
    return result


def mark_patient_done(hospital: str, date: str, dept: str,
                      patient_id: str) -> dict:
    """
    Mark a specific patient as done and reduce queue count.
    Raises ValueError if patient not found.
    """
    pq = store.get_patients_queue()
    try:
        patients = pq[hospital][date][dept]
    except KeyError:
        raise ValueError("No queue found for the given hospital/date/department")

    for patient in patients:
        if patient["id"] == patient_id:
            patient["status"] = "done"
            queues = store.get_queues()
            shift = patient["shift"]
            try:
                if queues[hospital][date][dept][shift] > 0:
                    queues[hospital][date][dept][shift] -= 1
            except KeyError:
                pass
            return {
                "success": True,
                "freed_slot": patient["slot"],
                "shift": shift,
                "patient_name": patient["name"],
            }
    raise ValueError("Patient not found in queue")


def reset_all_queues() -> None:
    """Clear all queue data (admin operation)."""
    store.get_patients_queue().clear()
    store.get_queues().clear()


def get_hospital_busyness() -> dict:
    """Return busyness status for all known hospitals."""
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")

    hospitals = [
        "Apollo Hospital", "Kamineni Hospital", "Care Hospital",
        "AIG Hospital", "Yashoda Hospital", "Government Hospital", "Medicover Hospital",
    ]

    queues = store.get_queues()
    result = {}
    for hospital in hospitals:
        total = 0
        if hospital in queues and today in queues[hospital]:
            for dept_data in queues[hospital][today].values():
                total += dept_data.get("morning", 0) + dept_data.get("afternoon", 0)

        if total == 0:
            result[hospital] = {"status": "available", "color": "#27ae60",
                                "queue_count": 0, "estimated_wait": "< 5 min"}
        elif total <= 5:
            result[hospital] = {"status": "moderate", "color": "#f39c12",
                                "queue_count": total, "estimated_wait": "15-30 min"}
        else:
            result[hospital] = {"status": "busy", "color": "#e74c3c",
                                "queue_count": total, "estimated_wait": "30+ min"}
    return result


def get_doctors(hospital_filter: str = None, dept_filter: str = None) -> list:
    """Return public doctor profiles with optional filters."""
    result = []
    for username, user in store.get_users().items():
        if user.get("role") != "doctor":
            continue
        if hospital_filter and user.get("hospital") != hospital_filter:
            continue
        if dept_filter and user.get("department") != dept_filter:
            continue
        result.append({
            "username": username,
            "name": user.get("name", "Doctor"),
            "department": user.get("department"),
            "hospital": user.get("hospital"),
            "qualification": user.get("qualification", "MBBS"),
            "experience": user.get("experience", "5+ Years"),
            "bio": user.get("bio", "Experienced Specialist"),
            "image": user.get("image", "https://via.placeholder.com/150"),
        })
    return result
