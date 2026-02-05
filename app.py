from flask import Flask
from extensions import mongo

def create_app():
    app = Flask(__name__)

    # Full connection string
    app.config["MONGO_URI"] = "mongodb+srv://jim2305341288_db_user:CarbonProject2026@cluster0.yjldidw.mongodb.net/digital_carbon_db?retryWrites=true&w=majority&appName=Cluster0"
    
    # Initialize mongo
    mongo.init_app(app)

    with app.app_context():
        # Import blueprints INSIDE the context
        from routes.auth_routes import auth_bp
        from routes.activity_routes import activity_bp
        from routes.analytics_routes import analytics_bp
        from routes.ml_routes import ml_bp  

        # Register them
        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(activity_bp, url_prefix='/activity')
        app.register_blueprint(analytics_bp, url_prefix='/analytics')
        app.register_blueprint(ml_bp, url_prefix='/ml') 

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)