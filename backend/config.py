"""
Application configuration — reads from environment variables.
Use .env for local dev; set real env vars on Render/Railway for production.
"""
import os
from pathlib import Path

# Base directory of the backend package
BASE_DIR = Path(__file__).parent


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "careflo-dev-secret-change-in-prod")
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    PORT = int(os.getenv("PORT", 5001))

    # Data directory — JSON stores live here
    DATA_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data")))

    USERS_FILE = DATA_DIR / "users.json"
    PRESCRIPTIONS_FILE = DATA_DIR / "prescriptions.json"
    SLOTS_FILE = DATA_DIR / "slots.json"
    RATINGS_FILE = DATA_DIR / "ratings.json"

    # CORS origins — comma-separated list, or "*" for open
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


def get_config():
    env = os.getenv("FLASK_ENV", "development")
    if env == "production":
        return ProductionConfig()
    return DevelopmentConfig()
