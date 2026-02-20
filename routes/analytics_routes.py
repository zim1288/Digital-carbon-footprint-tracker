from flask import Blueprint, jsonify
from datetime import datetime, timedelta
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

    