import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables from your .env file
load_dotenv()

# ==========================
# 1. Connect to MongoDB
# ==========================
# Safely grab the URI from the environment variable
MONGO_URI = os.getenv("MONGO_URI")

# Connect to the database
client = MongoClient(MONGO_URI)
db = client["digital_carbon_db"]