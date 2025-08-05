import os
from flask import Blueprint, request, jsonify, session
from datetime import datetime, timedelta

plaid_bp = Blueprint('plaid', __name__)

# Plaid configuration - simplified for demo
# In production, you would use actual Plaid credentials
PLAID_CLIENT_ID = os.getenv('PLAID_CLIENT_ID', 'demo_client_id')
PLAID_SECRET = os.getenv('PLAID_SECRET', 'demo_secret')
PLAID_ENV = os.getenv('PLAID_ENV', 'sandbox')

# For demo purposes, we'll create mock responses
# In production, you would configure the actual Plaid client

@plaid_bp.route('/create_link_token', methods=['POST'])
def create_link_token():
    """Create a link token for Plaid Link initialization"""
    try:
        # For demo purposes, return a mock link token
        # In production, you would call the actual Plaid API
        return jsonify({
            'link_token': 'demo_link_token_12345',
            'expiration': (datetime.now() + timedelta(hours=4)).isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@plaid_bp.route('/exchange_public_token', methods=['POST'])
def exchange_public_token():
    """Exchange public token for access token"""
    try:
        data = request.get_json()
        public_token = data.get('public_token')
        
        if not public_token:
            return jsonify({'error': 'Public token is required'}), 400
        
        # For demo purposes, return mock access token
        # In production, you would exchange with Plaid API
        session['plaid_access_token'] = 'demo_access_token_12345'
        
        return jsonify({
            'access_token': 'demo_access_token_12345',
            'item_id': 'demo_item_id_12345'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@plaid_bp.route('/status', methods=['GET'])
def get_connection_status():
    """Check if user has connected Plaid account"""
    try:
        access_token = session.get('plaid_access_token')
        return jsonify({
            'connected': bool(access_token),
            'access_token_exists': bool(access_token)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@plaid_bp.route('/portfolio_summary', methods=['GET'])
def get_portfolio_summary():
    """Get portfolio summary data"""
    try:
        access_token = session.get('plaid_access_token')
        if not access_token:
            return jsonify({'error': 'No connected account found'}), 400
        
        # Mock portfolio data for demo
        mock_data = {
            'total_value': 125750.50,
            'account_balances': {
                'acc_001': {
                    'name': 'Investment Account',
                    'balance': 85250.25
                },
                'acc_002': {
                    'name': 'Retirement Account',
                    'balance': 40500.25
                }
            },
            'asset_allocation': {
                'stocks': {
                    'value': 75450.30,
                    'percentage': 60.0
                },
                'bonds': {
                    'value': 25150.10,
                    'percentage': 20.0
                },
                'cash': {
                    'value': 12575.05,
                    'percentage': 10.0
                },
                'other': {
                    'value': 12575.05,
                    'percentage': 10.0
                }
            }
        }
        
        return jsonify(mock_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@plaid_bp.route('/holdings', methods=['GET'])
def get_holdings():
    """Get investment holdings"""
    try:
        access_token = session.get('plaid_access_token')
        if not access_token:
            return jsonify({'error': 'No connected account found'}), 400
        
        # Mock holdings data for demo
        mock_data = {
            'accounts': [
                {
                    'account_id': 'acc_001',
                    'name': 'Investment Account',
                    'type': 'investment',
                    'subtype': 'brokerage'
                },
                {
                    'account_id': 'acc_002',
                    'name': 'Retirement Account',
                    'type': 'investment',
                    'subtype': '401k'
                }
            ],
            'holdings': [
                {
                    'account_id': 'acc_001',
                    'security_id': 'sec_001',
                    'quantity': 100,
                    'institution_price': 150.25,
                    'institution_value': 15025.00,
                    'cost_basis': 140.00
                },
                {
                    'account_id': 'acc_001',
                    'security_id': 'sec_002',
                    'quantity': 50,
                    'institution_price': 85.50,
                    'institution_value': 4275.00,
                    'cost_basis': 80.00
                },
                {
                    'account_id': 'acc_002',
                    'security_id': 'sec_003',
                    'quantity': 200,
                    'institution_price': 45.75,
                    'institution_value': 9150.00,
                    'cost_basis': 42.00
                }
            ],
            'securities': [
                {
                    'security_id': 'sec_001',
                    'name': 'Apple Inc.',
                    'ticker_symbol': 'AAPL',
                    'type': 'equity'
                },
                {
                    'security_id': 'sec_002',
                    'name': 'Microsoft Corporation',
                    'ticker_symbol': 'MSFT',
                    'type': 'equity'
                },
                {
                    'security_id': 'sec_003',
                    'name': 'Vanguard S&P 500 ETF',
                    'ticker_symbol': 'VOO',
                    'type': 'etf'
                }
            ]
        }
        
        return jsonify(mock_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@plaid_bp.route('/transactions', methods=['GET'])
def get_transactions():
    """Get investment transactions"""
    try:
        access_token = session.get('plaid_access_token')
        if not access_token:
            return jsonify({'error': 'No connected account found'}), 400
        
        # Get date range from query parameters
        start_date = request.args.get('start_date', (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
        end_date = request.args.get('end_date', datetime.now().strftime('%Y-%m-%d'))
        
        # Mock transaction data for demo
        mock_data = {
            'transactions': [
                {
                    'account_id': 'acc_001',
                    'security_id': 'sec_001',
                    'date': '2025-01-15',
                    'name': 'Apple Inc.',
                    'type': 'buy',
                    'subtype': 'buy',
                    'quantity': 10,
                    'price': 150.25,
                    'amount': 1502.50,
                    'fees': 0.00
                },
                {
                    'account_id': 'acc_001',
                    'security_id': 'sec_002',
                    'date': '2025-01-10',
                    'name': 'Microsoft Corporation',
                    'type': 'buy',
                    'subtype': 'buy',
                    'quantity': 25,
                    'price': 85.50,
                    'amount': 2137.50,
                    'fees': 0.00
                },
                {
                    'account_id': 'acc_002',
                    'security_id': 'sec_003',
                    'date': '2025-01-05',
                    'name': 'Vanguard S&P 500 ETF',
                    'type': 'buy',
                    'subtype': 'buy',
                    'quantity': 50,
                    'price': 45.75,
                    'amount': 2287.50,
                    'fees': 0.00
                }
            ],
            'securities': [
                {
                    'security_id': 'sec_001',
                    'name': 'Apple Inc.',
                    'ticker_symbol': 'AAPL',
                    'type': 'equity'
                },
                {
                    'security_id': 'sec_002',
                    'name': 'Microsoft Corporation',
                    'ticker_symbol': 'MSFT',
                    'type': 'equity'
                },
                {
                    'security_id': 'sec_003',
                    'name': 'Vanguard S&P 500 ETF',
                    'ticker_symbol': 'VOO',
                    'type': 'etf'
                }
            ]
        }
        
        return jsonify(mock_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@plaid_bp.route('/disconnect', methods=['POST'])
def disconnect_account():
    """Disconnect Plaid account"""
    try:
        # Remove access token from session
        session.pop('plaid_access_token', None)
        
        return jsonify({'message': 'Account disconnected successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

