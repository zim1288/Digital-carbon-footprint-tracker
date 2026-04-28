from collections import defaultdict
from datetime import datetime, timedelta, timezone

from extensions import mongo
from flask import Blueprint, jsonify

analytics_bp = Blueprint("analytics_bp", __name__)


# ==============================
# Fetch All Activities for User
# ==============================
@analytics_bp.route("/user-activities/<email>", methods=["GET"])
def get_user_activities(email):
    try:
        # Added .sort() and .limit(100) to protect server memory
        activities = list(mongo.db.activities.find({"user_email": email}).sort("date", -1).limit(100))

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
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

    activities = list(mongo.db.activities.find({"user_email": email, "date": {"$gte": seven_days_ago}}))

    if not activities:
        return (
            jsonify({"message": "No activity found in the last 7 days.", "most_carbon_producing_activity": None}),
            200,
        )

    activity_breakdown = defaultdict(float)

    for activity in activities:
        act_type = activity.get("activity_type", "Unknown")
        carbon = activity.get("carbon_emission_g", 0)
        activity_breakdown[act_type] += carbon

    if not activity_breakdown:
        return jsonify({"message": "No carbon data found."}), 200

    highest_activity_type = max(activity_breakdown, key=activity_breakdown.get)
    highest_carbon_value = activity_breakdown[highest_activity_type]

    return (
        jsonify(
            {
                "most_carbon_producing_activity": {
                    "activity_type": highest_activity_type,
                    "total_carbon_g": round(highest_carbon_value, 2),
                }
            }
        ),
        200,
    )


# ==============================
# User Dashboard Data
# ==============================
@analytics_bp.route("/dashboard/<email>", methods=["GET"])
def get_dashboard(email):
    try:
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        activities = list(mongo.db.activities.find({"user_email": email, "date": {"$gte": seven_days_ago}}))

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

        return (
            jsonify(
                {
                    "total_carbon_g": round(total_carbon, 2),
                    "risk_level": risk_level,
                    "weekly_emissions": [round(val, 2) for val in weekly_emissions],
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Error fetching dashboard data: {e}")
        return jsonify({"error": "Failed to load dashboard data"}), 500


# ==============================
# Fetch Today's Slider Usage (Leaves Tracker intact)
# ==============================
@analytics_bp.route("/today-usage/<email>", methods=["GET"])
def get_today_usage(email):
    try:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

        doc = mongo.db.activities.find_one(
            {"user_email": email, "date": {"$gte": today_start}, "is_daily_summary": True}
        )

        if doc and "usage_hours" in doc:
            return jsonify(doc["usage_hours"]), 200

        return jsonify({"streaming": 0, "calls": 0, "social": 0, "general": 0}), 200

    except Exception as e:
        print(f"Error fetching today's usage: {e}")
        return jsonify({"error": str(e)}), 500


# ==============================
# Fetch Today's Complete Breakdown (Sliders + Manual) for Pie Chart
# ==============================
@analytics_bp.route("/today-breakdown/<email>", methods=["GET"])
def get_today_breakdown(email):
    try:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

        # Fetch ALL activities from today
        activities = list(mongo.db.activities.find({"user_email": email, "date": {"$gte": today_start}}))

        breakdown = defaultdict(float)
        EMISSION_FACTORS = {"streaming": 55, "calls": 40, "social": 25, "general": 10}

        for act in activities:
            if act.get("is_daily_summary"):
                # Handle slider data
                usage = act.get("usage_hours", {})
                breakdown["Streaming"] += usage.get("streaming", 0) * EMISSION_FACTORS["streaming"]
                breakdown["Calls"] += usage.get("calls", 0) * EMISSION_FACTORS["calls"]
                breakdown["Social"] += usage.get("social", 0) * EMISSION_FACTORS["social"]
                breakdown["General"] += usage.get("general", 0) * EMISSION_FACTORS["general"]
            else:
                # Handle manual data
                act_type = act.get("activity_type", "Other").title()
                carbon = act.get("carbon_emission_g", 0)
                breakdown[act_type] += carbon

        # Format perfectly for the React Native Pie Chart
        pie_data = []
        colors = ["#FF8042", "#0088FE", "#00C49F", "#FFBB28", "#8884d8", "#ffc658", "#ff7300", "#a4de6c"]
        color_idx = 0

        for name, emissions in breakdown.items():
            if emissions > 0:
                pie_data.append(
                    {
                        "name": name,
                        "emissions": round(emissions, 2),
                        "color": colors[color_idx % len(colors)],
                        "legendFontColor": "#7F7F7F",
                        "legendFontSize": 12,
                    }
                )
                color_idx += 1

        return jsonify(pie_data), 200

    except Exception as e:
        print(f"Error fetching today's breakdown: {e}")
        return jsonify({"error": str(e)}), 500


# ==============================
# Formatted Weekly History for Recharts
# ==============================
@analytics_bp.route("/weekly-history/<email>", methods=["GET"])
def get_weekly_history(email):
    try:
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

        activities = list(mongo.db.activities.find({"user_email": email, "date": {"$gte": seven_days_ago}}))

        days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        history_map = {day: 0 for day in days_of_week}

        for act in activities:
            if "date" in act and isinstance(act["date"], datetime):
                day_name = act["date"].strftime("%a")
                history_map[day_name] += act.get("carbon_emission_g", 0)

        formatted_history = [{"day": day, "emissions": round(history_map[day], 2)} for day in days_of_week]

        return jsonify(formatted_history), 200

    except Exception as e:
        print(f"Error fetching weekly history: {e}")
        return jsonify({"error": str(e)}), 500
