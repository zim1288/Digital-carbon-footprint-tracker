from pymongo import MongoClient

# ==========================
# 1. Connect to MongoDB
# ==========================
MONGO_URI = "mongodb+srv://jim2305341288_db_user:CarbonProject2026@cluster0.yjldidw.mongodb.net/digital_carbon_db?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["digital_carbon_db"]