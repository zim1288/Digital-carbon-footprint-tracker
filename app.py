from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config

app = Flask(__name__)
app.config["MONGO_URI"] = Config.MONGO_URI
mongo = PyMongo(app)
CORS(app)


# ==============================
# Home Route
# ==============================
@app.route("/")
def home():
    return jsonify({"message": "Digital Carbon Tracker API Running ✅"})


