# services/carbon_service.py

# Emission factors in g CO2 per minute of activity
ACTIVITY_FACTORS = {
    "video_streaming": 0.36,
    "video_call": 0.24,
    "gaming": 0.30,
    "social_media": 0.12,
    "web_browsing": 0.08,
}

# Data transfer emission factor: 0.5g CO2 per MB
DATA_FACTOR = 0.5


def calculate_carbon(activity_type, duration_minutes, data_used_mb):
    """Return estimated carbon emission in grams for an activity.

    Combines a per-minute activity factor with a per-MB data-transfer factor.
    """
    if duration_minutes is None:
        duration_minutes = 0
    if data_used_mb is None:
        data_used_mb = 0

    factor = ACTIVITY_FACTORS.get(activity_type, 0.10)
    carbon_from_duration = float(duration_minutes) * factor
    carbon_from_data = float(data_used_mb) * DATA_FACTOR

    return round(carbon_from_duration + carbon_from_data, 4)
