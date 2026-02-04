from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import uuid
import os
import json
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# In-memory patient queue store: {hospital: {date: {department: [patient_records]}}}
# patient_record = {id, name, shift, slot, status, patient_username}
patients_queue = {}

# In-memory queue count store (for compatibility)
queues = {}

# Prescriptions store: mapping patient_username -> list of prescription records
prescriptions_store = {}
PRESCRIPTIONS_FILE = os.path.join(os.path.dirname(__file__), "prescriptions.json")


def load_prescriptions():
    global prescriptions_store
    if os.path.exists(PRESCRIPTIONS_FILE):
        try:
            with open(PRESCRIPTIONS_FILE, "r") as f:
                prescriptions_store = json.load(f)
        except Exception:
            prescriptions_store = {}
    else:
        prescriptions_store = {}


def save_prescriptions():
    try:
        with open(PRESCRIPTIONS_FILE, "w") as f:
            json.dump(prescriptions_store, f)
    except Exception:
        pass


# load prescriptions at startup
load_prescriptions()

# Users persisted to a JSON file for simplicity
USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")
USERS = {}

# Token -> user mapping (in-memory temporary tokens)
TOKENS = {}


def load_users():
    global USERS
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, "r") as f:
                USERS = json.load(f)
        except Exception:
            USERS = {}
    else:
        # initialize default users with hashed passwords
        USERS = {
            "admin": {"password": generate_password_hash("adminpass"), "role": "admin"},
            "doctor": {"password": generate_password_hash("doctorpass"), "role": "doctor", "department": "Cardiology"},
            "patient": {"password": generate_password_hash("patientpass"), "role": "patient"},
        }
        save_users()


def save_users():
    try:
        with open(USERS_FILE, "w") as f:
            json.dump(USERS, f)
    except Exception:
        pass


# load users at startup
load_users()


def token_required(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Missing token"}), 401
        token = auth.split(" ", 1)[1].strip()
        user = TOKENS.get(token)
        if not user:
            return jsonify({"error": "Invalid or expired token"}), 401
        # attach user to request context
        request.user = user
        request.token = token
        return f(*args, **kwargs)

    return wrapped


def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            user = getattr(request, "user", None)
            if not user:
                return jsonify({"error": "Authentication required"}), 401
            if user.get("role") not in allowed_roles:
                return jsonify({"error": "Forbidden"}), 403
            return f(*args, **kwargs)

        return wrapped

    return decorator


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    user = USERS.get(username)
    if not user or not check_password_hash(user.get("password", ""), password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = uuid.uuid4().hex
    # include department in login response if available (for doctors)
    TOKENS[token] = {"username": username, "role": user.get("role"), "department": user.get("department")}
    resp = {"token": token, "role": user.get("role"), "username": username}
    if user.get("department"):
        resp["department"] = user.get("department")
    return jsonify(resp), 200


@app.route("/auth/register", methods=["POST"])
def register():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    name = data.get("name")

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400
    if username in USERS:
        return jsonify({"error": "User already exists"}), 400

    USERS[username] = {"password": generate_password_hash(password), "role": "patient", "name": name}
    save_users()

    token = uuid.uuid4().hex
    TOKENS[token] = {"username": username, "role": "patient"}
    resp = {"token": token, "role": "patient", "username": username}
    return jsonify(resp), 201


@app.route("/auth/logout", methods=["POST"])
@token_required
def logout():
    token = getattr(request, "token", None)
    if token and token in TOKENS:
        TOKENS.pop(token, None)
    return jsonify({"success": True}), 200


@app.route("/book", methods=["POST"])
@token_required
@role_required(["patient"])
def book():
    data = request.json
    name = data.get("name")
    hospital = data.get("hospital")
    department = data.get("department")
    shift = data.get("shift")
    date = data.get("date")
    slot = data.get("slot")
    reference = data.get("reference")

    if not name or not hospital or not department or not shift or not date or not slot:
        return jsonify({"error": "Invalid data"}), 400

    # Store patient details
    patients_queue.setdefault(hospital, {})
    patients_queue[hospital].setdefault(date, {})
    patients_queue[hospital][date].setdefault(department, [])
    
    patient_id = str(uuid.uuid4())
    # attach the username of the authenticated patient so bookings are linked to accounts
    patient_username = getattr(request, "user", {}).get("username")
    patient_record = {
        "id": patient_id,
        "name": name,
        "shift": shift,
        "slot": slot,
        "status": "waiting",  # waiting, in-progress, done
        "patient_username": patient_username,
    }
    if reference:
        patient_record["reference"] = reference
    patients_queue[hospital][date][department].append(patient_record)

    # Also update count for compatibility
    queues.setdefault(hospital, {})
    queues[hospital].setdefault(date, {})
    queues[hospital][date].setdefault(department, {"morning": 0, "afternoon": 0})
    queues[hospital][date][department][shift] += 1

    return jsonify({"success": True, "patient_id": patient_id})


@app.route("/queues", methods=["GET"])
@token_required
def get_queues():
    # Return queues with optional date filter
    date_param = request.args.get("date")
    if date_param:
        # Return queues for a specific date across all hospitals
        result = {}
        for hospital, dates in queues.items():
            if date_param in dates:
                result[hospital] = dates[date_param]
        return jsonify(result), 200
    # Return all queues
    return jsonify(queues), 200


@app.route("/reset", methods=["POST"])
@token_required
@role_required(["admin"])
def reset_queues():
    queues.clear()
    patients_queue.clear()
    return jsonify({"success": True, "message": "Queues reset"}), 200


@app.route("/patients", methods=["GET"])
@token_required
def get_patients():
    """Get patients for a doctor's department. Query params: date, hospital, department"""
    user = getattr(request, "user", None)
    if user.get("role") != "doctor":
        return jsonify({"error": "Only doctors can access this"}), 403
    
    doctor_dept = request.args.get("department") or user.get("department", "General")
    date_param = request.args.get("date")
    hospital_param = request.args.get("hospital")
    
    result = {"morning": [], "afternoon": []}
    
    for hospital, dates in patients_queue.items():
        if hospital_param and hospital != hospital_param:
            continue
        for date, depts in dates.items():
            if date_param and date != date_param:
                continue
            dept_patients = depts.get(doctor_dept, [])
            for patient in dept_patients:
                if patient["status"] != "done":  # only show waiting/in-progress
                    # Include hospital and date in patient record for frontend
                    patient_with_location = dict(patient)
                    patient_with_location["hospital"] = hospital
                    patient_with_location["date"] = date
                    if patient["shift"] == "morning":
                        result["morning"].append(patient_with_location)
                    else:
                        result["afternoon"].append(patient_with_location)
    
    return jsonify(result), 200


@app.route("/my-bookings", methods=["GET"])
@token_required
@role_required(["patient"])
def my_bookings():
    user = getattr(request, "user", None)
    username = user.get("username")
    result = []
    for hospital, dates in patients_queue.items():
        for date, depts in dates.items():
            for dept, patients in depts.items():
                for patient in patients:
                    if patient.get("patient_username") == username:
                        p = dict(patient)
                        p["hospital"] = hospital
                        p["date"] = date
                        p["department"] = dept
                        result.append(p)
    return jsonify(result), 200


@app.route("/prescriptions", methods=["POST"])
@token_required
@role_required(["doctor"])
def add_prescription():
    data = request.json or {}
    patient_username = data.get("patient_username")
    medications = data.get("medications")  # New format: array of {tablet, dosage, days}
    text = data.get("text")  # Legacy format
    booking_ref = data.get("reference")
    hospital = data.get("hospital")
    department = data.get("department")
    slot = data.get("slot")

    if not patient_username:
        return jsonify({"error": "patient_username required"}), 400

    # Accept either medications (new format) or text (legacy format)
    if not medications and not text:
        return jsonify({"error": "medications or text required"}), 400

    rec = {
        "id": uuid.uuid4().hex,
        "medications": medications if medications else None,  # New format
        "text": text if text else None,  # Legacy format
        "reference": booking_ref,
        "hospital": hospital,
        "department": department,
        "slot": slot,
        "doctor": getattr(request, "user", {}).get("username"),
    }

    prescriptions_store.setdefault(patient_username, [])
    prescriptions_store[patient_username].append(rec)
    save_prescriptions()
    return jsonify({"success": True, "prescription": rec}), 201


@app.route("/prescriptions", methods=["GET"])
@token_required
def get_prescriptions():
    user = getattr(request, "user", None)
    # If patient requests, return their own prescriptions
    if user.get("role") == "patient":
        patient_username = user.get("username")
        return jsonify(prescriptions_store.get(patient_username, [])), 200

    # If doctor requests, allow query by patient_username
    if user.get("role") == "doctor":
        patient_username = request.args.get("patient_username")
        if not patient_username:
            return jsonify({"error": "patient_username query param required for doctors"}), 400
        return jsonify(prescriptions_store.get(patient_username, [])), 200

    return jsonify({"error": "Forbidden"}), 403


@app.route("/patient-done", methods=["POST"])
@token_required
def mark_patient_done():
    """Mark a patient's checkup as done"""
    user = getattr(request, "user", None)
    if user.get("role") != "doctor":
        return jsonify({"error": "Only doctors can perform this action"}), 403
    
    data = request.json or {}
    hospital = data.get("hospital")
    date = data.get("date")
    department = data.get("department")
    patient_id = data.get("patient_id")
    
    if not all([hospital, date, department, patient_id]):
        return jsonify({"error": "Missing parameters"}), 400
    
    try:
        patients = patients_queue[hospital][date][department]
        for patient in patients:
            if patient["id"] == patient_id:
                shift = patient["shift"]
                slot = patient["slot"]
                patient["status"] = "done"
                # Update count
                if queues.get(hospital, {}).get(date, {}).get(department, {}).get(shift, 0) > 0:
                    queues[hospital][date][department][shift] -= 1
                return jsonify({
                    "success": True,
                    "freed_slot": slot,
                    "shift": shift,
                    "patient_name": patient["name"]
                }), 200
        return jsonify({"error": "Patient not found"}), 404
    except KeyError:
        return jsonify({"error": "Invalid hospital/date/department"}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
