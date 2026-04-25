"""
Auth decorators — token_required and role_required.
Imported by all route blueprints that need protection.
"""
import logging
from functools import wraps

from flask import jsonify, request

from models import store

logger = logging.getLogger(__name__)


def token_required(f):
    """Verify Bearer token and attach user dict to request.user."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or malformed token"}), 401
        token = auth_header.split(" ", 1)[1].strip()
        user = store.get_user_by_token(token)
        if not user:
            return jsonify({"error": "Invalid or expired token"}), 401
        request.user = user
        request.token = token
        return f(*args, **kwargs)
    return decorated


def role_required(allowed_roles: list):
    """Restrict endpoint to users whose role is in allowed_roles."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = getattr(request, "user", None)
            if not user:
                return jsonify({"error": "Authentication required"}), 401
            if user.get("role") not in allowed_roles:
                return jsonify({"error": "Forbidden — insufficient role"}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
