import pytest
from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_home_status(client):
    rv = client.get("/")
    assert rv.status_code == 200


def test_home_message(client):
    rv = client.get("/")
    data = rv.get_json()
    assert "message" in data
    assert "Hello" in data["message"]


def test_health(client):
    rv = client.get("/health")
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["status"] == "healthy"
