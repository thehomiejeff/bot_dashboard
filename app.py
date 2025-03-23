#!/usr/bin/env python3
# Telegram Bot Monitoring Dashboard
# Main Application File

from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO
import sqlite3
import os
import json
import psutil
import time
import datetime
from threading import Thread

# Initialize Flask application
app = Flask(__name__)
app.config['SECRET_KEY'] = 'telegram-bot-dashboard-secret-key'
socketio = SocketIO(app)

# Database setup
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database', 'bot_monitor.db')

def init_db():
    """Initialize the SQLite database with required tables if they don't exist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create bots table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS bots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        api_token TEXT,
        status TEXT DEFAULT 'inactive',
        last_active TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create metrics table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bot_id INTEGER,
        cpu_usage REAL,
        memory_usage REAL,
        message_count INTEGER,
        response_time REAL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bot_id) REFERENCES bots (id)
    )
    ''')
    
    # Create errors table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS errors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bot_id INTEGER,
        error_type TEXT,
        error_message TEXT,
        severity TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bot_id) REFERENCES bots (id)
    )
    ''')
    
    # Create security_events table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS security_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bot_id INTEGER,
        event_type TEXT,
        description TEXT,
        severity TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bot_id) REFERENCES bots (id)
    )
    ''')
    
    conn.commit()
    conn.close()

# Initialize empty database
def insert_sample_data():
    """Initialize empty database without sample data"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if we already have data
    cursor.execute("SELECT COUNT(*) FROM bots")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return
    
    # No sample data will be inserted - we'll use empty states instead
    
    conn.commit()
    conn.close()

# Routes
@app.route('/')
def index():
    """Render the main dashboard page"""
    return render_template('index.html')

@app.route('/bots')
def bots():
    """Render the bots management page"""
    return render_template('bots.html')

@app.route('/logs')
def logs():
    """Render the logs explorer page"""
    return render_template('logs.html')

@app.route('/alerts')
def alerts():
    """Render the alerts management page"""
    return render_template('alerts.html')

# API Routes
@app.route('/api/bots', methods=['GET'])
def get_bots():
    """API endpoint to get all bots"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM bots ORDER BY last_active DESC")
    bots = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(bots)

@app.route('/api/bots/<int:bot_id>', methods=['GET'])
def get_bot(bot_id):
    """API endpoint to get a specific bot"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM bots WHERE id = ?", (bot_id,))
    bot = dict(cursor.fetchone())
    
    conn.close()
    return jsonify(bot)

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """API endpoint to get metrics for all bots or a specific bot"""
    bot_id = request.args.get('bot_id')
    time_range = request.args.get('time_range', '24h')
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Convert time range to hours
    hours = 24
    if time_range == '1h':
        hours = 1
    elif time_range == '6h':
        hours = 6
    elif time_range == '7d':
        hours = 24 * 7
    elif time_range == '30d':
        hours = 24 * 30
    
    time_limit = (datetime.datetime.now() - datetime.timedelta(hours=hours)).isoformat()
    
    if bot_id:
        cursor.execute("""
        SELECT * FROM metrics 
        WHERE bot_id = ? AND timestamp > ? 
        ORDER BY timestamp
        """, (bot_id, time_limit))
    else:
        cursor.execute("""
        SELECT * FROM metrics 
        WHERE timestamp > ? 
        ORDER BY timestamp
        """, (time_limit,))
    
    metrics = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(metrics)

@app.route('/api/errors', methods=['GET'])
def get_errors():
    """API endpoint to get errors for all bots or a specific bot"""
    bot_id = request.args.get('bot_id')
    severity = request.args.get('severity')
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = "SELECT * FROM errors"
    params = []
    
    if bot_id or severity:
        query += " WHERE"
        
        if bot_id:
            query += " bot_id = ?"
            params.append(bot_id)
            
        if severity:
            if bot_id:
                query += " AND"
            query += " severity = ?"
            params.append(severity)
    
    query += " ORDER BY timestamp DESC LIMIT 100"
    
    cursor.execute(query, params)
    errors = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(errors)

@app.route('/api/security', methods=['GET'])
def get_security_events():
    """API endpoint to get security events"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM security_events ORDER BY timestamp DESC LIMIT 100")
    events = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(events)

@app.route('/api/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    """API endpoint to get dashboard summary data"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get total bots count
    cursor.execute("SELECT COUNT(*) as total FROM bots")
    total_bots = cursor.fetchone()['total']
    
    # Get active bots count
    cursor.execute("SELECT COUNT(*) as active FROM bots WHERE status = 'active'")
    active_bots = cursor.fetchone()['active']
    
    # Get bots with errors
    cursor.execute("""
    SELECT COUNT(DISTINCT bot_id) as error_bots 
    FROM errors 
    WHERE timestamp > datetime('now', '-24 hours')
    """)
    error_bots = cursor.fetchone()['error_bots']
    
    # Get total errors in last 24 hours
    cursor.execute("""
    SELECT COUNT(*) as total_errors 
    FROM errors 
    WHERE timestamp > datetime('now', '-24 hours')
    """)
    total_errors = cursor.fetchone()['total_errors']
    
    # Get average CPU and memory usage
    cursor.execute("""
    SELECT AVG(cpu_usage) as avg_cpu, AVG(memory_usage) as avg_memory 
    FROM metrics 
    WHERE timestamp > datetime('now', '-1 hour')
    """)
    result = cursor.fetchone()
    avg_cpu = result['avg_cpu'] if result['avg_cpu'] else 0
    avg_memory = result['avg_memory'] if result['avg_memory'] else 0
    
    conn.close()
    
    return jsonify({
        'total_bots': total_bots,
        'active_bots': active_bots,
        'error_bots': error_bots,
        'total_errors': total_errors,
        'avg_cpu': round(avg_cpu, 2),
        'avg_memory': round(avg_memory, 2)
    })

# WebSocket for real-time updates
@socketio.on('connect')
def handle_connect():
    """Handle WebSocket connection"""
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    print('Client disconnected')

# Simulated real-time data updates
def background_update_thread():
    """Background thread to simulate real-time data updates"""
    while True:
        # Generate random metrics update
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM bots WHERE status = 'active'")
        active_bot_ids = [row[0] for row in cursor.fetchall()]
        
        for bot_id in active_bot_ids:
            # Random CPU and memory fluctuations
            cpu_usage = round(5 + 15 * (bot_id / len(active_bot_ids)) + 5 * (time.time() % 10) / 10, 2)
            memory_usage = round(50 + 30 * (bot_id / len(active_bot_ids)) + 10 * (time.time() % 15) / 15, 2)
            
            # Random message count and response time
            message_count = int(10 + 5 * (time.time() % 20) / 20)
            response_time = round(0.2 + 0.3 * (time.time() % 5) / 5, 2)
            
            # Insert new metrics
            cursor.execute('''
            INSERT INTO metrics (bot_id, cpu_usage, memory_usage, message_count, response_time)
            VALUES (?, ?, ?, ?, ?)
            ''', (bot_id, cpu_usage, memory_usage, message_count, response_time))
            
            # Occasionally generate errors (1% chance)
            if time.time() % 100 < 1:
                error_types = ['API Error', 'Timeout', 'Authentication Failed', 'Rate Limit Exceeded']
                severities = ['low', 'medium', 'high', 'critical']
                
                error_type = error_types[int(time.time()) % len(error_types)]
                message = f"Error occurred: {error_type} in bot operation"
                severity = severities[int(time.time()) % len(severities)]
                
                cursor.execute('''
                INSERT INTO errors (bot_id, error_type, error_message, severity)
                VALUES (?, ?, ?, ?)
                ''', (bot_id, error_type, message, severity))
                
                # Emit error event
                socketio.emit('new_error', {
                    'bot_id': bot_id,
                    'error_type': error_type,
                    'error_message': message,
                    'severity': severity,
                    'timestamp': datetime.datetime.now().isoformat()
                })
        
        conn.commit()
        conn.close()
        
        # Emit metrics update event
        socketio.emit('metrics_update', {
            'timestamp': datetime.datetime.now().isoformat()
        })
        
        # Sleep for a longer interval to reduce log frequency
        time.sleep(30)

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Insert sample data
    insert_sample_data()
    
    # Start background thread for simulated updates
    update_thread = Thread(target=background_update_thread)
    update_thread.daemon = True
    update_thread.start()
    
    # Start the Flask application
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True, log_output=False)
