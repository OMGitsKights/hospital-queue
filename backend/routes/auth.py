"""Auth routes — /auth/login, /auth/register, /auth/logout."""
from flask import Blueprint, jsonify, request

from services import auth_service
from utils.auth import token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    try:
        result = auth_service.login_user(
            data.get("username", ""), data.get("password", "")
        )
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    cfg = request.app_config
    try:
        result = auth_service.register_user(
            username=data.get("username", ""),
            password=data.get("password", ""),
            name=data.get("name", ""),
            role=data.get("role", "patient"),
            department=data.get("department", ""),
            cfg=cfg,
        )
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout():
    auth_service.logout_user(request.token)
    return jsonify({"success": True}), 200
