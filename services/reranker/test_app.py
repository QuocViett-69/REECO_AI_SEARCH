import unittest
from threading import Event

from fastapi.testclient import TestClient

from app import MODEL_ID, MODEL_REVISION, create_app


class FakeRuntime:
    loaded = True
    device = "cpu"

    def score(self, _query, documents):
        return [float(document) for document in documents], 1.25


class ServiceTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(create_app(FakeRuntime()))

    def test_health_and_stable_ranking(self):
        health = self.client.get("/health").json()
        self.assertEqual(
            (health["model"], health["revision"], health["loaded"]),
            (MODEL_ID, MODEL_REVISION, True),
        )
        response = self.client.post(
            "/rerank",
            json={
                "query": "sensor",
                "candidates": [
                    {"product_id": "A", "document": "1"},
                    {"product_id": "B", "document": "3"},
                    {"product_id": "C", "document": "3"},
                ],
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [item["product_id"] for item in response.json()["results"]],
            ["B", "C", "A"],
        )

    def test_rejects_more_than_five_and_duplicate_ids(self):
        candidates = [
            {"product_id": str(index), "document": "1"} for index in range(6)
        ]
        self.assertEqual(
            self.client.post(
                "/rerank", json={"query": "sensor", "candidates": candidates}
            ).status_code,
            422,
        )
        self.assertEqual(
            self.client.post(
                "/rerank",
                json={
                    "query": "sensor",
                    "candidates": [
                        {"product_id": "A", "document": "1"},
                        {"product_id": "A", "document": "2"},
                    ],
                },
            ).status_code,
            422,
        )

    def test_health_is_not_ready_while_model_loads(self):
        ready = Event()

        class SlowRuntime:
            loaded = False
            load_failed = False
            device = "cpu"

            def load(self):
                ready.wait(1)
                self.loaded = True

        with TestClient(create_app(SlowRuntime())) as client:
            self.assertEqual(client.get("/health").json()["status"], "not_ready")
            self.assertEqual(
                client.post(
                    "/rerank",
                    json={
                        "query": "sensor",
                        "candidates": [{"product_id": "A", "document": "1"}],
                    },
                ).status_code,
                503,
            )
            ready.set()


if __name__ == "__main__":
    unittest.main()
