from datetime import datetime, timezone

from extensions import mongo
from flask import Blueprint, jsonify, request
from services.carbon_service import calculate_carbon, upsert_daily_activity

# Define the Blueprint
activity_bp = Blueprint("activity_bp", __name__)


# ==========================================
# Add Single Activity
# ==========================================
@activity_bp.route("/add-activity", methods=["POST"])
def add_activity():
    # 1. Get JSON Data
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # 2. Extract Fields
    user_email = data.get("user_email")
    activity_type = data.get("activity_type")
    duration = data.get("duration_minutes", 0)  # Default to 0 if missing
    data_used = data.get("data_used_mb", 0)  # Default to 0 if missing

    # 3. Validation
    if not user_email or not activity_type:
        return jsonify({"error": "Missing 'user_email' or 'activity_type'"}), 400

    try:
        # 4. Calculate Carbon
        carbon_result = calculate_carbon(activity_type, duration, data_used)

        # 5. Create the Database Document (Timezone-Aware)
        new_activity = {
            "user_email": user_email,
            "activity_type": activity_type,
            "duration_minutes": duration,
            "data_used_mb": data_used,
            "carbon_emission_g": carbon_result,
            "date": datetime.now(timezone.utc),
        }

        # 6. Insert into MongoDB
        result = mongo.db.activities.insert_one(new_activity)

        return (
            jsonify(
                {
                    "message": "Activity tracked successfully!",
                    "id": str(result.inserted_id),
                    "carbon_emission_g": carbon_result,
                }
            ),
            201,
        )

    except Exception as e:
        print(f"Error adding activity: {e}")
        return jsonify({"error": str(e)}), 500


# ==========================================
# Update Daily Usage Sliders
# ==========================================
@activity_bp.route("/log-daily", methods=["POST"])
def log_daily():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    user_email = data.get("user_email")
    usage = data.get("usage")  # Expecting a dict like: {"streaming": 2.5, "calls": 1.0, ...}

    if not user_email or not usage:
        return jsonify({"error": "Missing 'user_email' or 'usage' data"}), 400

    try:
        # Save to database and get the calculated total
        total_carbon = upsert_daily_activity(mongo, user_email, usage)

        return jsonify({"message": "Daily usage synced successfully!", "carbon_emission_g": total_carbon}), 200

    except Exception as e:
        print(f"Error logging daily activity: {e}")
        return jsonify({"error": str(e)}), 500
