# services/carbon_service.py
from datetime import datetime, timezone, timedelta

# ==========================================
# Carbon Calculation
# ==========================================
def calculate_carbon(activity_type, duration_minutes, data_mb):
    if data_mb is None:
        data_mb = 0
    
    # Base calculation from data
    emission = float(data_mb) * 0.5
    
    if activity_type == "Gaming":
        emission += float(duration_minutes) * 0.6
    elif activity_type == "Coding":
        emission += float(duration_minutes) * 0.05
        
    return emission

# ==========================================
# Find highest carbon activity (Last 7 Days)
# ==========================================
def get_most_carbon_activity(mongo, email):
    # Fetch activities ONLY for the last 7 days for relevant tips
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    activities = list(mongo.db.activities.find({
        "user_email": email,
        "date": {"$gte": seven_days_ago} 
    }))
    
    if not activities:
        return None
        
    # Group by activity_type and sum up the carbon emissions
    activity_totals = {}
    for act in activities:
        # Use Title Case for nicer formatting
        activity_type = act.get("activity_type", "Unknown Activity").title()
        carbon = act.get("carbon_emission_g", 0)
        
        if activity_type in activity_totals:
            activity_totals[activity_type] += carbon
        else:
            activity_totals[activity_type] = carbon
            
    # Find the activity with the highest total
    if not activity_totals:
        return None
        
    highest_activity = max(activity_totals, key=activity_totals.get)
    highest_carbon = activity_totals[highest_activity]
    
    # Return the exact dictionary format expected by the route
    return {
        "activity_type": highest_activity,
        "total_carbon_g": round(highest_carbon, 2)
    }

# ==========================================
# Daily Usage Tracker Logic 
# ==========================================
EMISSION_FACTORS = {
    "streaming": 55,
    "calls": 40,
    "social": 25,
    "general": 10
}

def calculate_daily_emissions(usage_data):
    """Calculates total emissions based on hours used per category"""
    total = 0
    total += usage_data.get("streaming", 0) * EMISSION_FACTORS["streaming"]
    total += usage_data.get("calls", 0) * EMISSION_FACTORS["calls"]
    total += usage_data.get("social", 0) * EMISSION_FACTORS["social"]
    total += usage_data.get("general", 0) * EMISSION_FACTORS["general"]
    return total

def upsert_daily_activity(mongo, email, usage_data):
    """Creates or updates today's carbon footprint record"""
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    total_carbon = calculate_daily_emissions(usage_data)
    
    # Look for a record that belongs to this user for TODAY
    query = {
        "user_email": email,
        "date": {"$gte": today_start},
        "is_daily_summary": True # Flag to separate from old individual logs
    }
    
    update_data = {
        "$set": {
            "user_email": email,
            "usage_hours": usage_data,
            "carbon_emission_g": total_carbon,
            "is_daily_summary": True
        },
        # Only set the exact date when we first create the document
        "$setOnInsert": {
            "date": datetime.now(timezone.utc)
        }
    }
    
    # upsert=True means: Update it if it exists, Create it if it doesn't!
    mongo.db.activities.update_one(query, update_data, upsert=True)
    
    return total_carbon