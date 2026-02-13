import os
from flask import Flask
from flask_cors import CORS
from extensions import mongo
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app) # Enable CORS for all routes

    # Pull credentials from .env safely
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    
    # Initialize mongo
    mongo.init_app(app)

    with app.app_context():
        # Import blueprints
        from routes.auth_routes import auth_bp
        from routes.activity_routes import activity_bp
        from routes.analytics_routes import analytics_bp
        from routes.ml_routes import ml_bp    

        # Register blueprints
        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(activity_bp, url_prefix='/activity')
        app.register_blueprint(analytics_bp, url_prefix='/analytics')
        app.register_blueprint(ml_bp, url_prefix='/ml') 

    # Base Test Route
    @app.route("/")
    def home():
        return "Digital Carbon Tracker Backend Running Successfully 🚀"

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)