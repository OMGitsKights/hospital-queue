"""
CareFlo Backend — Application Factory
======================================
Starts the Flask app, registers all blueprints, and wires configuration.

Run locally:
    python app.py

Production (Render / Railway):
    Set PORT, SECRET_KEY, FLASK_ENV=production in the dashboard env vars.
"""
import logging
import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

# Load .env for local development (no-op in production where vars are set natively)
load_dotenv()

from config import get_config
from models import store
from routes.auth import auth_bp
from routes.appointments import appointments_bp
from routes.prescriptions import prescriptions_bp
from routes.slots import slots_bp
from routes.ratings import ratings_bp
from routes.notifications import notifications_bp


def create_app() -> Flask:
    app = Flask(__name__)
    cfg = get_config()

    # ------------------------------------------------------------------
    # Logging
    # ------------------------------------------------------------------
    logging.basicConfig(
        level=logging.INFO if not cfg.DEBUG else logging.DEBUG,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    CORS(app, origins=cfg.CORS_ORIGINS)

    # ------------------------------------------------------------------
    # Load all persistent data
    # ------------------------------------------------------------------
    store.load_all(cfg)

    # ------------------------------------------------------------------
    # Inject config onto every request via before_request hook
    # This avoids global state and lets services receive cfg cleanly.
    # ------------------------------------------------------------------
    @app.before_request
    def attach_config():
        from flask import request as req
        req.app_config = cfg

    # ── Home ──────────────────────────────────────────────────────────────
    @app.route("/", methods=["GET"])
    def home():
        return {"message": "API is running"}

    # ------------------------------------------------------------------
    # Register blueprints
    # ------------------------------------------------------------------
    app.register_blueprint(auth_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(prescriptions_bp)
    app.register_blueprint(slots_bp)
    app.register_blueprint(ratings_bp)
    app.register_blueprint(notifications_bp)

    # ------------------------------------------------------------------
    # Global error handlers
    # ------------------------------------------------------------------
    @app.errorhandler(404)
    def not_found(e):
        return {"error": "Endpoint not found"}, 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return {"error": "Method not allowed"}, 405

    @app.errorhandler(500)
    def internal_error(e):
        app.logger.exception("Internal Server Error")
        return {"error": "Internal server error"}, 500

    app.logger.info("CareFlo API started — debug=%s", cfg.DEBUG)
    return app


if __name__ == "__main__":
    application = create_app()
    port = int(os.getenv("PORT", 5001))
    application.run(host="0.0.0.0", port=port)
