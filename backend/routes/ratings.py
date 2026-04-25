"""Ratings routes — GET and POST /ratings."""
from flask import Blueprint, jsonify, request

from services import rating_service
from utils.auth import role_required, token_required

ratings_bp = Blueprint("ratings", __name__)


@ratings_bp.route("/ratings", methods=["POST"])
@token_required
@role_required(["patient"])
def add_rating():
    data = request.get_json(silent=True) or {}
    cfg = request.app_config
    try:
        record = rating_service.add_rating(
            data=data,
            patient_username=request.user["username"],
            cfg=cfg,
        )
        return jsonify({"success": True, "rating": record}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@ratings_bp.route("/ratings", methods=["GET"])
def get_ratings():
    result = rating_service.get_ratings(
        hospital=request.args.get("hospital"),
        department=request.args.get("department"),
    )
    return jsonify(result), 200
