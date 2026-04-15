from flask import Blueprint, jsonify, request
from extensions import mongo
import os
import json
import urllib.request

# Import ALL your service functions
from services.ml_service import generate_ml_features, predict_carbon_risk, generate_training_dataset
from services.recommendation_service import generate_recommendations
from services.carbon_service import get_most_carbon_activity

ml_bp = Blueprint("ml", __name__)

# ==============================
# Helper: Securely Call Gemini API
# ==============================
def fetch_from_gemini(prompt):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in the .env file")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response generated.")
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise

# ==============================
# 1. ML Feature Dataset API
# ==============================
@ml_bp.route("/ml-features/<email>", methods=["GET"])
def ml_features(email):
    # NOW USING REAL DATA!
    result = generate_ml_features(mongo, email)
    if result is None:
        return jsonify({"error": "No activity data found for this user"}), 404
        
    # Convert pandas DataFrame to a JSON-friendly list of dictionaries
    return jsonify(result.to_dict(orient="records")), 200

# ==============================
# 2. ML Prediction Endpoint
# ==============================
@ml_bp.route("/predict-carbon-risk/<email>", methods=["GET"])
def carbon_risk(email):
    # NOW USING REAL DATA!
    result = predict_carbon_risk(mongo, email)
    
    # Check if the service returned an error (like missing model file)
    if "error" in result:
        return jsonify(result), 400
        
    return jsonify(result), 200

# ==============================
# 3. Recommendation Endpoint 
# ==============================
@ml_bp.route("/recommendation/<email>", methods=["GET"]) 
def recommendations(email):
    try:
        # Check if user exists
        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        activities = list(mongo.db.activities.find({"user_email": email}))

        if not activities:
            return jsonify({
                "user_email": email,
                "recommendations": [
                    "Start tracking your digital activities to receive personalized eco suggestions."
                ]
            })

        video_streaming = 0
        social_media = 0
        total = len(activities)
        total_carbon = 0

        for act in activities:
            activity_type = act.get("activity_type", "").lower()
            carbon = act.get("carbon_emission_g", 0)

            total_carbon += carbon

            if "video" in activity_type:
                video_streaming += 1

            if "social" in activity_type:
                social_media += 1

        features = {
            "most_used_activity": "video_streaming" if video_streaming > social_media else "social_media",
            "video_streaming_ratio": video_streaming / total if total else 0,
            "social_media_ratio": social_media / total if total else 0,
            "avg_daily_carbon": total_carbon / total if total else 0
        }

        # Generate base recommendations
        recommendations_list = generate_recommendations(features)

        # Inject smart recommendation
        most_activity = get_most_carbon_activity(mongo, email)

        if most_activity and most_activity.get("activity_type"):
            activity_name = most_activity["activity_type"]
            carbon_value = most_activity["total_carbon_g"]

            smart_msg = f"Your highest carbon activity is {activity_name} ({carbon_value} g CO₂). Try reducing it to lower your footprint."
            
            # Insert at the very beginning of the list
            recommendations_list.insert(0, smart_msg)

        return jsonify({
            "user_email": email,
            "recommendations": recommendations_list
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================
# 4. Training Dataset Endpoint
# ==============================
@ml_bp.route("/training-dataset", methods=["GET"])
def training_dataset():
    # NOW USING REAL DATA! (Note: generate_training_dataset doesn't take mongo as an argument in your service)
    dataset = generate_training_dataset() 
    return jsonify(dataset.to_dict(orient="records")), 200

# ==============================
# 5. Secure Gemini AI - Analyze Usage
# ==============================
@ml_bp.route("/analyze-usage", methods=["POST"])
def analyze_usage():
    data = request.get_json()
    usage = data.get("usage", {})
    total_emissions = data.get("total_emissions", 0)

    # Dynamically read whatever activities the frontend sends (Gaming, Coding, Sliders, etc.)
    usage_text = ""
    for activity, emissions in usage.items():
        usage_text += f"    - {activity}: {emissions}\n"

    prompt = f"""
    Act as an environmental scientist. Analyze my daily digital carbon footprint.
    Here is my usage breakdown:
{usage_text}
    - Total Estimated Emissions: {total_emissions} grams of CO2.

    Provide a 3-sentence insight. 
    1. Identify the biggest offender.
    2. Compare this to a real world activity (like boiling a kettle or driving a car) to make it relatable.
    3. Give one specific, high-impact action to reduce it.
    Keep the tone friendly but urgent.
    """

    try:
        ai_text = fetch_from_gemini(prompt)
        return jsonify({"analysis": ai_text}), 200
    except Exception as e:
        print(f"Error in analyze_usage: {e}")
        return jsonify({"error": str(e)}), 500

# ==============================
# 6. Secure Gemini AI - Eco-Coach Chat
# ==============================
@ml_bp.route("/ask-coach", methods=["POST"])
def ask_coach():
    data = request.get_json()
    user_message = data.get("message", "")

    prompt = f"""
    You are "EcoBit", a helpful digital sustainability assistant.
    User Question: "{user_message}"
    Answer in 2 short sentences. Be factual and encouraging.
    """

    try:
        ai_text = fetch_from_gemini(prompt)
        return jsonify({"reply": ai_text}), 200
    except Exception as e:
        print(f"Error in ask_coach: {e}")
        return jsonify({"error": str(e)}), 500