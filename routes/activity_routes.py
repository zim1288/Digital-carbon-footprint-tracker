from flask import Blueprint, request, jsonify
from datetime import datetime
from extensions import mongo 
from services.carbon_service import calculate_carbon

# Match the name you used in your app.register_blueprint
activity_bp = Blueprint("activity_bp", __name__)

