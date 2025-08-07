import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from src.models.user import db
from src.models.client import Client
from src.routes.auth import auth_bp
from src.routes.plaid import plaid_bp
from src.routes.admin import admin_bp

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')

# Enable CORS for all routes
CORS(app)

app.register_blueprint(plaid_bp, url_prefix='/api/plaid')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_bp)

# Database configuration for Render (PostgreSQL)
def get_database_url():
    """Get database URL from environment variables"""
    # External PostgreSQL database URL from Render
    database_url = 'postgresql://qgi_1_user:55MoEmBnCxGPYOM2lCI8ATQIhwZzpiTc@dpg-d294atvdiees73fj795g-a.oregon-postgres.render.com/qgi_1'

    # Return the database URL, or fallback to SQLite for local development
    return database_url or 'sqlite:///investment_portal.db'

app.config['SQLALCHEMY_DATABASE_URI'] = get_database_url()
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
