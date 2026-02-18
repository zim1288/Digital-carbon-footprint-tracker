from flask import Blueprint, request, jsonify
from datetime import datetime
from extensions import mongo 
from services.carbon_service import calculate_carbon

# Define the Blueprint
activity_bp = Blueprint("activity_bp", __name__)

@activity_bp.route("/add-activity", methods=["POST"])
def add_activity():
    # 1. Get JSON Data
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # 2. Extract Fields
    user_email = data.get("user_email")
    activity_type = data.get("activity_type")
    duration = data.get("duration_minutes", 0) # Default to 0 if missing
    data_used = data.get("data_used_mb", 0)    # Default to 0 if missing

    # 3. Validation
    if not user_email or not activity_type:
        return jsonify({"error": "Missing 'user_email' or 'activity_type'"}), 400

    try:
        # 4. Calculate Carbon
        # calculate_carbon function returns a number (float/int)
        carbon_result = calculate_carbon(activity_type, duration, data_used)
        
        # 5. Create the Database Document
        new_activity = {
            "user_email": user_email,
            "activity_type": activity_type,
            "duration_minutes": duration,
            "data_used_mb": data_used,
            "carbon_emission_g": carbon_result, # This is what the dashboard looks for!
            "date": datetime.utcnow()           # ⚠️ CRITICAL: Must be a Date object for filtering
        }

        # 6. Insert into MongoDB
        # Note: Ensure collection name matches what analytics_routes uses ('activities')
        result = mongo.db.activities.insert_one(new_activity)

        return jsonify({
            "message": "Activity tracked successfully!",
            "id": str(result.inserted_id),
            "carbon_emission_g": carbon_result
        }), 201

    except Exception as e:
        print(f"Error adding activity: {e}")
        # 👇 This will send the specific error text to screen
        return jsonify({"error": str(e)}), 500