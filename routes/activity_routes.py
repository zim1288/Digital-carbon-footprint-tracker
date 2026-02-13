from flask import Blueprint, request, jsonify
from datetime import datetime
from extensions import mongo 
from services.carbon_service import calculate_carbon


activity_bp = Blueprint("activity_bp", __name__)

@activity_bp.route("/add-activity", methods=["POST"])
def add_activity():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    user_email = data.get("user_email")
    activity_type = data.get("activity_type")
    duration = data.get("duration_minutes")
    data_used = data.get("data_used_mb")

