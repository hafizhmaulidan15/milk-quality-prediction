import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.anyio
async def test_health_endpoint(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "model_loaded" in data


@pytest.mark.anyio
async def test_predict_endpoint(client):
    payload = {
        "storage_temp": 4.5,
        "ph": 6.7,
        "storage_time": 12.0,
        "pasteurization_temp": 72.0,
        "tpc": 5000,
        "grading_delta_hours": 2.5,
        "shift": "Pagi",
    }
    response = await client.post("/predict", json=payload)
    assert response.status_code in (200, 503)
    if response.status_code == 200:
        data = response.json()
        assert "predicted_grade" in data
        assert "confidence" in data
        assert "probabilities" in data
        assert "top_features" in data
        assert "recommendation" in data


@pytest.mark.anyio
async def test_predict_invalid_input(client):
    payload = {"storage_temp": "invalid", "ph": 6.7}
    response = await client.post("/predict", json=payload)
    assert response.status_code == 422
