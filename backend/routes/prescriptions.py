"""Prescription routes — GET and POST /prescriptions."""
from flask import Blueprint, jsonify, request

from services import prescription_service
from utils.auth import role_required, token_required

prescriptions_bp = Blueprint("prescriptions", __name__)


@prescriptions_bp.route("/prescriptions", methods=["POST"])
@token_required
@role_required(["doctor"])
def add_prescription():
    data = request.get_json(silent=True) or {}
    cfg = request.app_config
    try:
        record = prescription_service.add_prescription(
            data=data,
            doctor_username=request.user["username"],
            cfg=cfg,
        )
        return jsonify({"success": True, "prescription": record}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to save prescription", "detail": str(e)}), 500


@prescriptions_bp.route("/prescriptions", methods=["GET"])
@token_required
def get_prescriptions():
    user = request.user
    if user["role"] == "patient":
        return jsonify(
            prescription_service.get_prescriptions_for_patient(user["username"])
        ), 200

    if user["role"] == "doctor":
        patient_username = request.args.get("patient_username")
        if not patient_username:
            return jsonify({"error": "patient_username query param required"}), 400
        return jsonify(
            prescription_service.get_prescriptions_for_patient(patient_username)
        ), 200

    return jsonify({"error": "Forbidden"}), 403
