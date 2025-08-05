from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Client(db.Model):
    """Client model for storing client information and Plaid integration data"""
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    
    # Plaid integration fields
    plaid_access_token = db.Column(db.String(255), nullable=True)
    plaid_item_id = db.Column(db.String(255), nullable=True)
    plaid_connected_at = db.Column(db.DateTime, nullable=True)
    
    # Account status
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    def __repr__(self):
        return f'<Client {self.email}>'
    
    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def set_plaid_tokens(self, access_token, item_id):
        """Set Plaid access token and item ID"""
        self.plaid_access_token = access_token
        self.plaid_item_id = item_id
        self.plaid_connected_at = datetime.utcnow()
    
    def has_plaid_connection(self):
        """Check if client has connected Plaid account"""
        return bool(self.plaid_access_token and self.plaid_item_id)
    
    def to_dict(self, include_sensitive=False):
        """Convert client to dictionary"""
        data = {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'has_plaid_connection': self.has_plaid_connection(),
            'plaid_connected_at': self.plaid_connected_at.isoformat() if self.plaid_connected_at else None
        }
        
        if include_sensitive:
            data.update({
                'plaid_access_token': self.plaid_access_token,
                'plaid_item_id': self.plaid_item_id
            })
        
        return data

