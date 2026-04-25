"""
Data store abstraction layer — all JSON file I/O lives here.

In-memory dicts act as the "database". To swap in SQLAlchemy or another DB,
replace the load_*/save_* functions and the in-memory dicts without touching
any route or service code.
"""
import json
import logging
import uuid
from pathlib import Path

from werkzeug.security import generate_password_hash

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# In-memory stores
# ---------------------------------------------------------------------------
_users: dict = {}           # username → user dict
_tokens: dict = {}          # token → user identity dict
_patients_queue: dict = {}  # hospital → date → dept → [patient_records]
_queues: dict = {}          # hospital → date → dept → {morning:N, afternoon:N}
_prescriptions: dict = {}   # patient_username → [prescription records]
_slots: dict = {}           # doctor_username → {date → slot_data}
_ratings: list = []         # list of rating objects
_notifications: list = []   # in-memory emergency notifications


# ---------------------------------------------------------------------------
# Accessors (services always call these — never touch the private vars directly)
# ---------------------------------------------------------------------------
def get_users() -> dict:
    return _users

def get_tokens() -> dict:
    return _tokens

def get_patients_queue() -> dict:
    return _patients_queue

def get_queues() -> dict:
    return _queues

def get_prescriptions() -> dict:
    return _prescriptions

def get_slots() -> dict:
    return _slots

def get_ratings() -> list:
    return _ratings

def get_notifications() -> list:
    return _notifications


# ---------------------------------------------------------------------------
# Token helpers
# ---------------------------------------------------------------------------
def create_token(username: str, role: str, department: str = None) -> str:
    token = uuid.uuid4().hex
    payload = {"username": username, "role": role}
    if department:
        payload["department"] = department
    _tokens[token] = payload
    return token


def revoke_token(token: str) -> None:
    _tokens.pop(token, None)


from typing import Optional


def get_user_by_token(token: str) -> Optional[dict]:
    return _tokens.get(token)


# ---------------------------------------------------------------------------
# File I/O helpers
# ---------------------------------------------------------------------------
def _load_json(path: Path, default):
    if path.exists():
        try:
            with open(path, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error("Failed to load %s: %s", path, e)
    return default


def _save_json(path: Path, data) -> None:
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.error("Failed to save %s: %s", path, e)


# ---------------------------------------------------------------------------
# Load / Save — called once at startup and after mutations
# ---------------------------------------------------------------------------
def load_all(cfg) -> None:
    """Load all data files at application startup."""
    global _users, _prescriptions, _slots, _ratings

    _users.update(_load_json(cfg.USERS_FILE, {}))
    if not _users:
        _seed_default_users(cfg)

    _prescriptions.update(_load_json(cfg.PRESCRIPTIONS_FILE, {}))
    _slots.update(_load_json(cfg.SLOTS_FILE, {}))
    _ratings.extend(_load_json(cfg.RATINGS_FILE, []))
    logger.info("Data loaded — %d users, %d prescriptions",
                len(_users), len(_prescriptions))


def save_users(cfg) -> None:
    _save_json(cfg.USERS_FILE, _users)

def save_prescriptions(cfg) -> None:
    _save_json(cfg.PRESCRIPTIONS_FILE, _prescriptions)

def save_slots(cfg) -> None:
    _save_json(cfg.SLOTS_FILE, _slots)

def save_ratings(cfg) -> None:
    _save_json(cfg.RATINGS_FILE, _ratings)


# ---------------------------------------------------------------------------
# Default seed data
# ---------------------------------------------------------------------------
def _seed_default_users(cfg) -> None:
    """Populate a fresh users store with default accounts."""
    defaults = {
        "admin": {"password": generate_password_hash("adminpass"), "role": "admin"},
        "patient": {"password": generate_password_hash("patientpass"), "role": "patient", "name": "John Patient"},
        "doctor": {"password": generate_password_hash("doctorpass"), "role": "doctor",
                   "name": "Dr. Default", "department": "Cardiology", "hospital": "Apollo Hospital"},
        "dr_smith": {
            "password": generate_password_hash("doctorpass"), "role": "doctor",
            "name": "Dr. Smith", "department": "Cardiology", "hospital": "Apollo Hospital",
            "qualification": "MD, DM (Cardiology)", "experience": "15+ Years",
            "bio": "Senior Interventional Cardiologist specialising in complex angioplasties.",
            "image": "https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg",
        },
        "dr_jones": {
            "password": generate_password_hash("doctorpass"), "role": "doctor",
            "name": "Dr. Jones", "department": "Cardiology", "hospital": "Apollo Hospital",
            "qualification": "MBBS, DNB", "experience": "8+ Years",
            "bio": "Expert in preventive cardiology and heart failure management.",
            "image": "https://img.freepik.com/free-photo/portrait-smiling-handsome-male-doctor-man_171337-5055.jpg",
        },
        "dr_doe": {
            "password": generate_password_hash("doctorpass"), "role": "doctor",
            "name": "Dr. Doe", "department": "Orthopedics", "hospital": "Apollo Hospital",
            "qualification": "MS (Ortho)", "experience": "12+ Years",
            "bio": "Specialist in joint replacement and sports injuries.",
            "image": "https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg",
        },
        "dr_house": {
            "password": generate_password_hash("doctorpass"), "role": "doctor",
            "name": "Dr. House", "department": "General", "hospital": "Care Hospital",
            "qualification": "MD (Internal Medicine)", "experience": "20+ Years",
            "bio": "Diagnostician with a focus on rare diseases.",
            "image": "https://img.freepik.com/free-photo/medium-shot-scientist-with-stethoscope_23-2148154695.jpg",
        },
    }
    _users.update(defaults)
    save_users(cfg)
    logger.info("Seeded default users")
