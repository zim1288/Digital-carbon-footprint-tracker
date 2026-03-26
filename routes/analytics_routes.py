from flask import Blueprint, jsonify
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from extensions import mongo

analytics_bp = Blueprint("analytics_bp", __name__)

# ==============================
# Fetch All Activities for User (Fixes your 404)
# ==============================
@analytics_bp.route("/user-activities/<email>", methods=["GET"])
def get_user_activities(email):
    try:
        # Find all documents where user_email matches
        activities = list(mongo.db.activities.find({"user_email": email}))

        # Convert MongoDB ObjectIds and Dates to JSON-friendly format
        for activity in activities:
            activity["_id"] = str(activity["_id"])
            if "date" in activity and isinstance(activity["date"], datetime):
                activity["date"] = activity["date"].isoformat()

        return jsonify(activities), 200

    except Exception as e:
        print(f"Error fetching user activities: {e}")
        return jsonify({"error": str(e)}), 500

# ==============================
# Most Carbon Producing Activity
# ==============================
@analytics_bp.route("/most-carbon-activity/<email>", methods=["GET"])
def most_carbon_activity(email):
    # Using timezone-aware UTC for consistency
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

    activities = list(mongo.db.activities.find({
        "user_email": email,
        "date": {"$gte": seven_days_ago}
    }))

    if not activities:
        return jsonify({
            "message": "No activity found in the last 7 days.",
            "most_carbon_producing_activity": None
        }), 200

    activity_breakdown = defaultdict(float)
    
    for activity in activities:
        act_type = activity.get("activity_type", "Unknown")
        carbon = activity.get("carbon_emission_g", 0) 
        activity_breakdown[act_type] += carbon

    if not activity_breakdown:
        return jsonify({"message": "No carbon data found."}), 200

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
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
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