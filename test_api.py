import unittest
import json
from app import app, db, Chemical

class TestChemicalApp(unittest.TestCase):

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

    def test_workflow(self):
        # 1. Create a chemical
        new_chem = {
            "name": "Test Chem",
            "quantity": 10,
            "expiry": "2025-12-31",
            "lab": "Test Lab",
            "hazard": "Low"
        }
        response = self.client.post('/api/chemicals', 
                                    data=json.dumps(new_chem),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        chem_id = data['id']
        self.assertEqual(data['name'], "Test Chem")

        # 2. Get all chemicals
        response = self.client.get('/api/chemicals')
        self.assertEqual(response.status_code, 200)
        chems = json.loads(response.data)
        self.assertTrue(any(c['id'] == chem_id for c in chems))

        # 3. Delete the chemical
        response = self.client.delete(f'/api/chemicals/{chem_id}')
        self.assertEqual(response.status_code, 200)

        # 4. Verify deletion
        response = self.client.get('/api/chemicals')
        chems = json.loads(response.data)
        self.assertFalse(any(c['id'] == chem_id for c in chems))

if __name__ == "__main__":
    unittest.main()
