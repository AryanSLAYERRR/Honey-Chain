"""
HoneyChain Backend Automated Test Suite.
Tests live FastAPI endpoints and AI algorithms.
"""

import unittest
import json
import urllib.request
import urllib.error

API_URL = "http://127.0.0.1:8000/api"

class HoneyChainAPITestCase(unittest.TestCase):
    def test_01_health_endpoint(self):
        """Verify API health check endpoint returns 200 and ok status."""
        req = urllib.request.Request(f"{API_URL}/health")
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            self.assertEqual(data.get("status"), "ok")
            self.assertEqual(data.get("service"), "honeychain-api")

    def test_02_marketplace_listings(self):
        """Verify marketplace listings are served correctly."""
        req = urllib.request.Request(f"{API_URL}/marketplace/listings")
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            self.assertIsInstance(data, list)
            self.assertGreater(len(data), 0)
            first = data[0]
            self.assertIn("id", first)
            self.assertIn("floral_source", first)
            self.assertIn("quantity", first)

    def test_03_batches_endpoint(self):
        """Verify batches endpoint returns harvest batches."""
        req = urllib.request.Request(f"{API_URL}/batches")
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            self.assertIsInstance(data, list)
            self.assertGreater(len(data), 0)

    def test_04_consumer_verification_endpoint(self):
        """Verify consumer verification returns bottle lineage and NFC status."""
        req = urllib.request.Request(f"{API_URL}/verify/HC-BTL-000184")
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            self.assertEqual(data.get("id"), "HC-BTL-000184")
            self.assertIn("nfc", data)
            self.assertTrue(data["nfc"].get("is_authentic"))
            self.assertGreater(data["nfc"].get("scan_count", 0), 0)

    def test_05_ai_fraud_detection_model(self):
        """Verify AI fraud detection engine flags high moisture and excess yields."""
        from ai.fraud_detection import fraud_detector

        # Test normal batch
        clean_result = fraud_detector.evaluate_batch(
            batch_id="TEST-001",
            floral_source="Mustard",
            quantity_kg=120.0,
            reported_moisture=17.8,
            hive_count=4,
            has_harvest_photo=True
        )
        self.assertEqual(clean_result["recommendation"], "APPROVE")
        self.assertLess(clean_result["fraud_risk_score"], 20)
        self.assertEqual(len(clean_result["flags"]), 0)

        # Test adulterated high-moisture batch
        flagged_result = fraud_detector.evaluate_batch(
            batch_id="TEST-002",
            floral_source="Mustard",
            quantity_kg=500.0,
            reported_moisture=23.5, # Over legal 20% limit
            hive_count=2,
            has_harvest_photo=False
        )
        self.assertIn("EXCESS_MOISTURE", flagged_result["flags"])
        self.assertIn("ANOMALOUS_YIELD", flagged_result["flags"])
        self.assertGreater(flagged_result["fraud_risk_score"], 40)

    def test_06_ai_hive_health_model(self):
        """Verify AI hive health engine computes risk and optimal micro-climate."""
        from ai.hive_health import hive_health_model

        # Optimal temperatures ~35°C
        healthy_res = hive_health_model.analyze_hive(
            recent_temps=[34.5, 34.8, 35.1, 35.0],
            recent_hum=[58.0, 59.5, 60.0, 61.2],
            recent_weights=[41.0, 41.5, 42.0, 42.8]
        )
        self.assertEqual(healthy_res["disease_risk"], "low")
        self.assertGreaterEqual(healthy_res["health_score"], 85)
        self.assertGreater(healthy_res["predicted_yield_kg"], 20.0)

if __name__ == "__main__":
    unittest.main()
