"""
Appointment routes — booking, queue management, doctor patient list.
"""
from flask import Blueprint, jsonify, request

from services import appointment_service
from utils.auth import role_required, token_required

appointments_bp = Blueprint("appointments", __name__)


@appointments_bp.route("/book", methods=["POST"])
@token_required
@role_required(["patient"])
def book():
    data = request.get_json(silent=True) or {}
    try:
        result = appointment_service.book_appointment(
            data=data,
            patient_username=request.user["username"],
        )
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Booking failed", "detail": str(e)}), 500


@appointments_bp.route("/my-bookings", methods=["GET"])
@token_required
@role_required(["patient"])
def my_bookings():
    result = appointment_service.get_my_bookings(request.user["username"])
    return jsonify(result), 200


@appointments_bp.route("/queues", methods=["GET"])
@token_required
def get_queues():
    date_filter = request.args.get("date")
    result = appointment_service.get_queue_counts(date_filter)
    return jsonify(result), 200


@appointments_bp.route("/patients", methods=["GET"])
@token_required
@role_required(["doctor"])
def get_patients():
    result = appointment_service.get_patients_for_doctor(
        doctor_user=request.user,
        date_filter=request.args.get("date"),
        hospital_filter=request.args.get("hospital"),
    )
    return jsonify(result), 200


@appointments_bp.route("/patient-done", methods=["POST"])
@token_required
@role_required(["doctor"])
def patient_done():
    data = request.get_json(silent=True) or {}
    try:
        result = appointment_service.mark_patient_done(
            hospital=data.get("hospital", ""),
            date=data.get("date", ""),
            dept=data.get("department", ""),
            patient_id=data.get("patient_id", ""),
        )
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@appointments_bp.route("/reset", methods=["POST"])
@token_required
@role_required(["admin"])
def reset_queues():
    appointment_service.reset_all_queues()
    return jsonify({"success": True, "message": "All queues reset"}), 200
