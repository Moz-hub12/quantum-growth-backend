from flask import Blueprint, request, jsonify, session
from functools import wraps
from datetime import datetime
from src.models.admin import AdminUser, AuditLog
from src.models.client import Client
from src.models.user import db
import logging

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def admin_required(f):
    """Decorator to require admin authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_user_id' not in session:
            return jsonify({'error': 'Admin authentication required'}), 401
        
        admin_user = AdminUser.query.get(session['admin_user_id'])
        if not admin_user or not admin_user.is_active:
            session.pop('admin_user_id', None)
            return jsonify({'error': 'Invalid admin session'}), 401
        
        # Add admin_user to request context
        request.admin_user = admin_user
        return f(*args, **kwargs)
    return decorated_function

def log_admin_action(action, resource_type, resource_id=None, details=None):
    """Log admin actions for audit trail"""
    try:
        if hasattr(request, 'admin_user'):
            audit_log = AuditLog(
                admin_user_id=request.admin_user.id,
                action=action,
                resource_type=resource_type,
                resource_id=str(resource_id) if resource_id else None,
                details=details,
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', '')[:255]
            )
            db.session.add(audit_log)
            db.session.commit()
    except Exception as e:
        logging.error(f"Failed to log admin action: {e}")

# Authentication Routes
@admin_bp.route('/login', methods=['POST'])
def admin_login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        admin_user = AdminUser.query.filter_by(username=username).first()
        
        if admin_user and admin_user.check_password(password) and admin_user.is_active:
            session['admin_user_id'] = admin_user.id
            admin_user.update_last_login()
            
            log_admin_action('login', 'admin_session')
            
            return jsonify({
                'message': 'Login successful',
                'admin_user': admin_user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        logging.error(f"Admin login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@admin_bp.route('/logout', methods=['POST'])
@admin_required
def admin_logout():
    """Admin logout endpoint"""
    try:
        log_admin_action('logout', 'admin_session')
        session.pop('admin_user_id', None)
        return jsonify({'message': 'Logout successful'}), 200
    except Exception as e:
        logging.error(f"Admin logout error: {e}")
        return jsonify({'error': 'Logout failed'}), 500

@admin_bp.route('/me', methods=['GET'])
@admin_required
def get_admin_profile():
    """Get current admin user profile"""
    try:
        return jsonify(request.admin_user.to_dict()), 200
    except Exception as e:
        logging.error(f"Get admin profile error: {e}")
        return jsonify({'error': 'Failed to get profile'}), 500

# Client Management Routes
@admin_bp.route('/clients', methods=['GET'])
@admin_required
def get_all_clients():
    """Get all clients with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        
        query = Client.query
        
        # Apply search filter
        if search:
            query = query.filter(
                db.or_(
                    Client.first_name.ilike(f'%{search}%'),
                    Client.last_name.ilike(f'%{search}%'),
                    Client.email.ilike(f'%{search}%')
                )
            )
        
        # Apply status filter
        if status:
            is_active = status.lower() == 'active'
            query = query.filter(Client.is_active == is_active)
        
        # Paginate results
        clients = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        log_admin_action('view_clients', 'client_list', details=f'Page {page}, Search: {search}')
        
        return jsonify({
            'clients': [client.to_dict() for client in clients.items],
            'total': clients.total,
            'pages': clients.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        logging.error(f"Get clients error: {e}")
        return jsonify({'error': 'Failed to retrieve clients'}), 500

@admin_bp.route('/clients/<int:client_id>', methods=['GET'])
@admin_required
def get_client_details(client_id):
    """Get detailed information about a specific client"""
    try:
        client = Client.query.get_or_404(client_id)
        
        log_admin_action('view_client_details', 'client', client_id)
        
        # Get additional client data (this would be expanded with real Plaid data)
        client_data = client.to_dict()
        client_data['portfolio_summary'] = {
            'total_value': 125000.00,  # Mock data
            'cash_balance': 5000.00,
            'invested_amount': 120000.00,
            'total_return': 15000.00,
            'return_percentage': 12.5
        }
        
        return jsonify(client_data), 200
        
    except Exception as e:
        logging.error(f"Get client details error: {e}")
        return jsonify({'error': 'Failed to retrieve client details'}), 500

@admin_bp.route('/clients/<int:client_id>/status', methods=['PUT'])
@admin_required
def update_client_status(client_id):
    """Update client account status (activate/suspend)"""
    try:
        client = Client.query.get_or_404(client_id)
        data = request.get_json()
        
        new_status = data.get('is_active')
        if new_status is None:
            return jsonify({'error': 'is_active field required'}), 400
        
        old_status = client.is_active
        client.is_active = new_status
        db.session.commit()
        
        action = 'activate_client' if new_status else 'suspend_client'
        log_admin_action(
            action, 
            'client', 
            client_id, 
            f'Status changed from {old_status} to {new_status}'
        )
        
        return jsonify({
            'message': f'Client {"activated" if new_status else "suspended"} successfully',
            'client': client.to_dict()
        }), 200
        
    except Exception as e:
        logging.error(f"Update client status error: {e}")
        return jsonify({'error': 'Failed to update client status'}), 500

# Dashboard Routes
@admin_bp.route('/dashboard/stats', methods=['GET'])
@admin_required
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Get basic statistics
        total_clients = Client.query.count()
        active_clients = Client.query.filter_by(is_active=True).count()
        inactive_clients = total_clients - active_clients
        
        # Mock portfolio data (would be real data from Plaid in production)
        stats = {
            'total_clients': total_clients,
            'active_clients': active_clients,
            'inactive_clients': inactive_clients,
            'total_aum': 15750000.00,  # Mock total AUM
            'average_portfolio_value': 125000.00,
            'new_clients_this_month': 12,
            'total_transactions_today': 45
        }
        
        log_admin_action('view_dashboard', 'dashboard_stats')
        
        return jsonify(stats), 200
        
    except Exception as e:
        logging.error(f"Get dashboard stats error: {e}")
        return jsonify({'error': 'Failed to retrieve dashboard statistics'}), 500

# Audit Log Routes
@admin_bp.route('/audit-logs', methods=['GET'])
@admin_required
def get_audit_logs():
    """Get audit logs with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'logs': [log.to_dict() for log in logs.items],
            'total': logs.total,
            'pages': logs.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        logging.error(f"Get audit logs error: {e}")
        return jsonify({'error': 'Failed to retrieve audit logs'}), 500

