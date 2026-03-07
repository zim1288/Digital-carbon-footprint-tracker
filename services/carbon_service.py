# services/carbon_service.py
def calculate_carbon(data_mb):
    if data_mb is None:
        return 0
    # Basic logic: 0.5g of CO2 per 1MB of data
    return float(data_mb) * 0.5
