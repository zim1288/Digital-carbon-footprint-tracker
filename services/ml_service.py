import joblib
import pandas as pd
import os
import random
from datetime import datetime, timedelta

# 1. Model Path Setup 
BASE_DIR = os.path.dirname(os.path.dirname(__file__)) # backend 
MODEL_PATH = os.path.join(BASE_DIR, 'ml_model', 'carbon_risk_model.pkl')

def generate_ml_features(mongo, email):
    """
    Fetches user activity and prepares features for the model.
    (This function was missing, causing the import error)
    """
    try:
        # Fetch User Data from MongoDB
        activities = list(mongo.db.activities.find({"user_email": email}))

        if not activities:
            return None

        # Feature Engineering
        df = pd.DataFrame(activities)
        
        # Ensure correct column names exist based on your logic
        if "carbon_emission_g" not in df.columns:
            return None

        total_carbon = df["carbon_emission_g"].sum()
        avg_carbon = df["carbon_emission_g"].mean()

        # Return formatted dataframe
        return pd.DataFrame([[total_carbon, avg_carbon]], 
                          columns=["total_weekly_carbon", "avg_daily_carbon"])
    except Exception as e:
        print(f"Error generating features: {e}")
        return None

def predict_carbon_risk(mongo, email):
    """
    Loads the trained ML model and predicts risk based on user activity.
    """
    # 2. Check if model exists
    if not os.path.exists(MODEL_PATH):
        return {
            "error": "Model file not found. Please run train_model.py first.",
            "risk_level": "Unknown"
        }

    try:
        # 3. Load the Model
        model = joblib.load(MODEL_PATH)

        # 4. Use the helper function to get features
        features = generate_ml_features(mongo, email)

        if features is None or features.empty:
            return {
                "user_email": email,
                "risk_level": "Low",
                "message": "No activity data found, defaulting to Low risk."
            }

        # 5. Predict
        prediction_index = model.predict(features)[0] 

        # 6. Convert Result to Text
        # Training logic: 0=Low, 1=Medium, 2=High
        labels = {0: "Low", 1: "Medium", 2: "High"}
        risk_level = labels.get(prediction_index, "Unknown")

        return {
            "user_email": email,
            "total_carbon_g": round(features["total_weekly_carbon"][0], 2),
            "avg_carbon_g": round(features["avg_daily_carbon"][0], 2),
            "risk_level": risk_level,
            "prediction_source": "Logistic Regression Model 🤖"
        }

    except Exception as e:
        print(f"ML Error: {e}")
        return {"error": str(e), "risk_level": "Error"}

def generate_training_dataset():
    """
    Generates dummy data if needed for training routes.
    """
    data = []
    for _ in range(50):
        total = random.uniform(500, 10000)
        avg = total / 7
        data.append([total, avg])
    
    return pd.DataFrame(data, columns=["total_weekly_carbon", "avg_daily_carbon"])
