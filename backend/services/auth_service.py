"""
Auth service — login, register, logout business logic.
"""
import logging

from werkzeug.security import check_password_hash, generate_password_hash

from models import store

logger = logging.getLogger(__name__)


def login_user(username: str, password: str) -> dict:
    """
    Validate credentials and return a token payload.
    Raises ValueError on bad credentials.
    """
    if not username or not password:
        raise ValueError("username and password are required")

    users = store.get_users()
    user = users.get(username)
    if not user or not check_password_hash(user.get("password", ""), password):
        raise ValueError("Invalid username or password")

    token = store.create_token(
        username=username,
        role=user.get("role"),
        department=user.get("department"),
    )
    resp = {"token": token, "role": user.get("role"), "username": username}
    if user.get("department"):
        resp["department"] = user["department"]
    if user.get("name"):
        resp["name"] = user["name"]
    return resp


def register_user(username: str, password: str, name: str,
                  role: str, department: str, cfg) -> dict:
    """
    Create a new user account and return a token payload.
    Raises ValueError on invalid input.
    """
    if not username or not password:
        raise ValueError("username and password are required")

    users = store.get_users()
    if username in users:
        raise ValueError("Username already exists")

    if role not in ("patient", "doctor", "admin"):
        raise ValueError("Invalid role")

    if role == "doctor" and not department:
        raise ValueError("Department is required for doctor accounts")

    user_data = {
        "password": generate_password_hash(password),
        "role": role,
        "name": name or username,
    }
    if department:
        user_data["department"] = department

    users[username] = user_data
    store.save_users(cfg)

    token = store.create_token(username=username, role=role, department=department)
    resp = {"token": token, "role": role, "username": username}
    if department:
        resp["department"] = department
    if name:
        resp["name"] = name
    return resp


def logout_user(token: str) -> None:
    """Invalidate the given token."""
    store.revoke_token(token)
