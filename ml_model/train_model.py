import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# ================================
# 1. Connect to MongoDB
# ================================
# Retrieve the URI from the environment variables safely
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["digital_carbon_db"]

# ==========================
# 2️⃣ Load dataset
# ==========================
print("⏳ Fetching data from MongoDB...")
activities = list(db.activities.find())

if not activities:
    print("❌ No data found in database. Please add activities via Postman first.")
    exit()

data = pd.DataFrame(activities)