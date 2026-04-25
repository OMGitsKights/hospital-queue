"""
Notification & hospital-busyness routes.
Also includes /doctors public endpoint.
"""
import uuid
from datetime import datetime

from flask import Blueprint, jsonify, request

from models import store
from services import appointment_service
from utils.auth import role_required, token_required

notifications_bp = Blueprint("notifications", __name__)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@notifications_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "CareFlo API"}), 200


# ---------------------------------------------------------------------------
# Doctors (public — no auth required)
# ---------------------------------------------------------------------------
@notifications_bp.route("/doctors", methods=["GET"])
def get_doctors():
    result = appointment_service.get_doctors(
        hospital_filter=request.args.get("hospital"),
        dept_filter=request.args.get("department"),
    )
    return jsonify(result), 200


# ---------------------------------------------------------------------------
# Hospital busyness
# ---------------------------------------------------------------------------
@notifications_bp.route("/hospital-busyness", methods=["GET"])
@token_required
def hospital_busyness():
    return jsonify(appointment_service.get_hospital_busyness()), 200


# ---------------------------------------------------------------------------
# Emergency notifications (in-memory only)
# ---------------------------------------------------------------------------
@notifications_bp.route("/emergency-notify", methods=["POST"])
@token_required
@role_required(["doctor"])
def emergency_notify():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()
    if not message:
        return jsonify({"error": "message is required"}), 400

    user = request.user
    notification = {
        "id": uuid.uuid4().hex,
        "message": message,
        "doctor": user.get("username"),
        "department": user.get("department"),
        "hospital": data.get("hospital"),
        "timestamp": datetime.now().isoformat(),
    }

    notifications = store.get_notifications()
    notifications.append(notification)
    # Keep only the last 20
    if len(notifications) > 20:
        notifications.pop(0)

    return jsonify({"success": True, "notification": notification}), 201


@notifications_bp.route("/notifications", methods=["GET"])
def get_notifications():
    return jsonify(store.get_notifications()), 200
