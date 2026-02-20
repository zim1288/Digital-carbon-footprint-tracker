import joblib

model = joblib.load("ml_model/carbon_risk_model.pkl")

def predict_risk(features):

    input_data = [[
        features["total_weekly_carbon"],
        features["avg_daily_carbon"]
    ]]

    prediction = model.predict(input_data)[0]

    if prediction == 2:
        return "High"
    elif prediction == 1:
        return "Medium"
    else:
        return "Low"
