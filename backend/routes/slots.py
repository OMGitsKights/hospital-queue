"""Slot availability routes — GET and POST /slots."""
from flask import Blueprint, jsonify, request

from services import slot_service
from utils.auth import role_required, token_required

slots_bp = Blueprint("slots", __name__)


@slots_bp.route("/slots", methods=["GET"])
@token_required
def get_slots():
    date = request.args.get("date")
    if not date:
        return jsonify({"error": "date query param required"}), 400

    result = slot_service.get_slot_availability(
        doctor_username=request.args.get("doctor_username"),
        department=request.args.get("department"),
        date=date,
        hospital=request.args.get("hospital"),
    )
    return jsonify(result), 200


@slots_bp.route("/slots", methods=["POST"])
@token_required
@role_required(["doctor"])
def update_slots():
    data = request.get_json(silent=True) or {}
    cfg = request.app_config
    try:
        slot_service.save_slot_availability(
            doctor_username=request.user["username"],
            date=data.get("date", ""),
            unavailable=data.get("unavailable_slots", []),
            duration=int(data.get("duration", 30)),
            hospital=data.get("hospital", ""),
            department=data.get("department", ""),
            cfg=cfg,
        )
        return jsonify({"success": True}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
