from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='.', static_url_path='', template_folder='.')
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chemicals.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Model Definition
class Chemical(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    expiry = db.Column(db.String(20), nullable=False)
    lab = db.Column(db.String(100), nullable=False)
    hazard = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "quantity": self.quantity,
            "expiry": self.expiry,
            "lab": self.lab,
            "hazard": self.hazard
        }

# Create Database Tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chemicals', methods=['GET'])
def get_chemicals():
    chemicals = Chemical.query.all()
    return jsonify([c.to_dict() for c in chemicals])

@app.route('/api/chemicals', methods=['POST'])
def add_chemical():
    data = request.json
    
    # Basic Validation
    if not data.get('name') or not data.get('expiry') or not data.get('lab') or not data.get('hazard'):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        quantity = int(data.get('quantity'))
        if quantity <= 0:
             return jsonify({"error": "Quantity must be positive"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid quantity format"}), 400

    new_chemical = Chemical(
        name=data['name'],
        quantity=quantity,
        expiry=data['expiry'],
        lab=data['lab'],
        hazard=data['hazard']
    )
    db.session.add(new_chemical)
    db.session.commit()
    return jsonify(new_chemical.to_dict()), 201

@app.route('/api/chemicals/<int:id>', methods=['DELETE'])
def delete_chemical(id):
    chemical = Chemical.query.get(id)
    if chemical:
        db.session.delete(chemical)
        db.session.commit()
        return jsonify({"message": "Chemical deleted"}), 200
    return jsonify({"error": "Chemical not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
