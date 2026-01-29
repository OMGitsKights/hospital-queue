from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# -----------------------------
# Data Stores (in-memory)
# -----------------------------
queues = {}
booked_slots = {}  # key = (hospital, department, date) → set(slots)

MORNING_SLOTS = [
    "9:00 AM - 9:30 AM",
    "9:30 AM - 10:00 AM",
    "10:00 AM - 10:30 AM",
    "10:30 AM - 11:00 AM",
    "11:00 AM - 11:30 AM",
    "11:30 AM - 12:00 PM",
]

AFTERNOON_SLOTS = [
    "2:00 PM - 2:30 PM",
    "2:30 PM - 3:00 PM",
    "3:00 PM - 3:30 PM",
    "3:30 PM - 4:00 PM",
    "4:00 PM - 4:30 PM",
    "4:30 PM - 5:00 PM",
]

# -----------------------------
# Get Available Slots
# -----------------------------
@app.route("/slots", methods=["GET"])
def get_slots():
    hospital = request.args.get("hospital")
    department = request.args.get("department")
    date = request.args.get("date")

    key = (hospital, department, date)
    used = booked_slots.get(key, set())

    return jsonify({
        "morning": [s for s in MORNING_SLOTS if s not in used],
        "afternoon": [s for s in AFTERNOON_SLOTS if s not in used]
    })

# -----------------------------
# Book Appointment
# -----------------------------
@app.route("/book", methods=["POST"])
def book():
    data = request.json
    name = data["name"]
    hospital = data["hospital"]
    department = data["department"]
    date = data["date"]
    slot = data["time_slot"]

    key = (hospital, department, date)

    if key not in booked_slots:
        booked_slots[key] = set()

    if slot in booked_slots[key]:
        return jsonify({"error": "Slot already booked"}), 400

    booked_slots[key].add(slot)

    queues.setdefault(hospital, {})
    queues[hospital].setdefault(department, [])
    queues[hospital][department].append({
        "name": name,
        "slot": slot,
        "date": date
    })

    return jsonify({"success": True})

# -----------------------------
# Queue Dashboard
# -----------------------------
@app.route("/queues", methods=["GET"])
def get_queues():
    return jsonify(queues)

# -----------------------------
# Reset
# -----------------------------
@app.route("/reset", methods=["POST"])
def reset():
    queues.clear()
    booked_slots.clear()
    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(debug=True)
