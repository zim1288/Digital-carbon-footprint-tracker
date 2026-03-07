import os
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# ==========================
# 1. Connect to MongoDB
# ==========================
# Retrieve the URI from the environment variables safely
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["digital_carbon_db"]

# ==========================
# 2. Load dataset
# ==========================
print("⏳ Fetching data from MongoDB...")
activities = list(db.activities.find())

if not activities:
    print("❌ No data found in database. Please add activities via Postman first.")
    exit()

data = pd.DataFrame(activities)

# Check if required columns exist
if "carbon_emission_g" not in data.columns or "user_email" not in data.columns:
    print("❌ Data missing 'carbon_emission_g' or 'user_email' fields.")
    print("Current columns:", data.columns)
    exit()

# ==========================
# 3. Feature Engineering
# ==========================
print("⚙️ Processing features...")

grouped = data.groupby("user_email").agg({
    "carbon_emission_g": ["sum", "mean"],
})

grouped.columns = ["total_weekly_carbon", "avg_daily_carbon"]
grouped = grouped.reset_index()

def generate_label(value):
    if value > 500:
        return 2  # High Risk
    elif value > 250:
        return 1  # Medium Risk
    else:
        return 0  # Low Risk

grouped["risk_label"] = grouped["total_weekly_carbon"].apply(generate_label)

print(f"✔ Data Processed: {len(grouped)} unique users found.")

# ==========================
# 4. Prepare X and y
# ==========================
X = grouped[["total_weekly_carbon", "avg_daily_carbon"]]
y = grouped["risk_label"]

# ==========================
# 5. Train-Test Split
# ==========================
if len(grouped) < 2:
    print("⚠️ Not enough data to split. Training on full dataset.")
    X_train, X_test, y_train, y_test = X, X, y, y
else:
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

# ==========================
# 6. Train Model
# ==========================
print("🧠 Training Logistic Regression Model...")
model = LogisticRegression()
model.fit(X_train, y_train)

# ==========================
# 7. Evaluate
# ==========================
predictions = model.predict(X_test)
print("\n🔍 Model Evaluation:")
print(classification_report(y_test, predictions))

# ==========================
# 8. Save Model
# ==========================
model_path = "ml_model/carbon_risk_model.pkl"

if not os.path.exists("ml_model"):
    model_path = "carbon_risk_model.pkl" 

joblib.dump(model, model_path)
print(f"✅ Model saved successfully at: {model_path}")