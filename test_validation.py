import unittest
import json
from app import app, db

class TestChemicalValidation(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_missing_fields(self):
        # Missing name
        chem = {"quantity": 10, "expiry": "2025-01-01", "lab": "L1", "hazard": "Low"}
        response = self.client.post('/api/chemicals', 
                                    data=json.dumps(chem),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_negative_quantity(self):
        # Negative quantity
        chem = {"name": "Bad Chem", "quantity": -5, "expiry": "2025-01-01", "lab": "L1", "hazard": "Low"}
        response = self.client.post('/api/chemicals', 
                                    data=json.dumps(chem),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_valid_chemical(self):
        # Valid
        chem = {"name": "Good Chem", "quantity": 5, "expiry": "2025-01-01", "lab": "L1", "hazard": "Low"}
        response = self.client.post('/api/chemicals', 
                                    data=json.dumps(chem),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 201)

if __name__ == "__main__":
    unittest.main()
