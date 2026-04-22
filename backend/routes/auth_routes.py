from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import mongo
import re

auth_bp = Blueprint("auth_bp", __name__)

# Helper function to enforce strong password policy
def is_strong_password(password):
    if len(password) < 8:
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    return True

@auth_bp.route("/register", methods=["POST"])
def register():
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON in request"}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # Basic validation
    if not all([name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    # Password strength validation
    if not is_strong_password(password):
        return jsonify({
            "error": "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
        }), 400

    # Check if user exists
    if mongo.db.users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    # Hash the password and save
    hashed_password = generate_password_hash(password)
    mongo.db.users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON in request"}), 400

    email = data.get("email")
    password = data.get("password")

    # Look up user
    user = mongo.db.users.find_one({"email": email})

    # Verify password safely
    if user and check_password_hash(user.get("password", ""), password):
        return jsonify({
            "message": "Login successful",
            "user": {
                "name": user.get("name"),
                "email": user.get("email")
            }
        }), 200
    
    # NEW: Better text for the frontend popup!
    return jsonify({"error": "Wrong email or password!"}), 401