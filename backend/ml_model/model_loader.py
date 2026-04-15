import os
import joblib

_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                           "ml_model", "carbon_risk_model.pkl")

_model = None


def _load_model():
    """Load and cache the model on first use."""
    global _model
    if _model is None:
        if not os.path.exists(_MODEL_PATH):
            raise FileNotFoundError(
                f"Model file not found at '{_MODEL_PATH}'. "
                "Please run ml_model/train_model.py first."
            )
        _model = joblib.load(_MODEL_PATH)
    return _model


def predict_risk(features):
    model = _load_model()

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
