from flask import Blueprint, jsonify
from datetime import datetime, timedelta
from collections import defaultdict
from extensions import mongo

analytics_bp = Blueprint("analytics_bp", __name__)

# ==============================
# Most Carbon Producing Activity
# ==============================
@analytics_bp.route("/most-carbon-activity/<email>", methods=["GET"])
def most_carbon_activity(email):
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    activities = list(mongo.db.activities.find({
        "user_email": email,
        "date": {"$gte": seven_days_ago}
    }))

    if not activities:
        return jsonify({
            "message": "No activity found in the last 7 days.",
            "most_carbon_producing_activity": None
        }), 200

    # Group carbon emissions by activity_type
    activity_breakdown = defaultdict(float)
    
    for activity in activities:
        act_type = activity.get("activity_type", "Unknown")
        carbon = activity.get("carbon_emission_g", 0) 
        activity_breakdown[act_type] += carbon

    if not activity_breakdown:
        return jsonify({"message": "No carbon data found."}), 200

    # Find the highest contributor
    highest_activity_type = max(activity_breakdown, key=activity_breakdown.get)
    highest_carbon_value = activity_breakdown[highest_activity_type]

    return jsonify({
        "most_carbon_producing_activity": {
            "activity_type": highest_activity_type,
            "total_carbon_g": round(highest_carbon_value, 2)
        }
    }), 200


# ==============================
# User Dashboard Data
# ==============================
@analytics_bp.route("/dashboard/<email>", methods=["GET"])
def get_dashboard(email):
    try:
        # Fetch activities for the last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        activities = list(mongo.db.activities.find({
            "user_email": email,
            "date": {"$gte": seven_days_ago}
        }))

        total_carbon = 0
        weekly_emissions = [0, 0, 0, 0, 0, 0, 0]

        for act in activities:
            carbon = act.get("carbon_emission_g", 0)
            total_carbon += carbon
        
            if "date" in act and isinstance(act["date"], datetime):
                day_index = act["date"].weekday()
                weekly_emissions[day_index] += carbon

        # Basic logic to determine risk level 
        risk_level = "low"
        if total_carbon > 5000:
            risk_level = "high"
        elif total_carbon > 2000:
            risk_level = "medium"

        return jsonify({
            "total_carbon_g": round(total_carbon, 2),
            "risk_level": risk_level,
            "weekly_emissions": [round(val, 2) for val in weekly_emissions]
        }), 200

    except Exception as e:
        print(f"Error fetching dashboard data: {e}")
        return jsonify({"error": "Failed to load dashboard data"}), 500