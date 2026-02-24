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

