import os
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash
from datetime import datetime
from src.models.client import Client, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new client"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if client already exists
        existing_client = Client.query.filter_by(email=data['email']).first()
        if existing_client:
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new client
        client = Client(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone')
        )
        client.set_password(data['password'])
        
        db.session.add(client)
        db.session.commit()
        
        # Log in the client
        session['client_id'] = client.id
        session['client_email'] = client.email
        
        return jsonify({
            'message': 'Registration successful',
            'client': client.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a client"""
    try:
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find client by email
        client = Client.query.filter_by(email=email).first()
        
        if not client or not client.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not client.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Update last login
        client.last_login = datetime.utcnow()
        db.session.commit()
        
        # Set session
        session['client_id'] = client.id
        session['client_email'] = client.email
        
        return jsonify({
            'message': 'Login successful',
            'client': client.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout a client"""
    try:
        session.clear()
        return jsonify({'message': 'Logout successful'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get current client profile"""
    try:
        client_id = session.get('client_id')
        if not client_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        return jsonify({'client': client.to_dict()})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Update client profile"""
    try:
        client_id = session.get('client_id')
        if not client_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'first_name' in data:
            client.first_name = data['first_name']
        if 'last_name' in data:
            client.last_name = data['last_name']
        if 'phone' in data:
            client.phone = data['phone']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'client': client.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    """Change client password"""
    try:
        client_id = session.get('client_id')
        if not client_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        if not client.check_password(current_password):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters long'}), 400
        
        client.set_password(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/status', methods=['GET'])
def get_auth_status():
    """Check authentication status"""
    client_id = session.get('client_id')
    client_email = session.get('client_email')
    
    return jsonify({
        'authenticated': bool(client_id),
        'client_id': client_id,
        'client_email': client_email
    })

