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
        "temperature": 5.0,
        "fat": 4.0,
        "snf": 8.8,
        "protein": 3.2,
        "lactose": 4.7,
        "salt": 0.15,
        "total_solid": 12.8,
        "density": 1.030,
        "added_water": 0.5,
        "freezing_point": -0.540,
        "ph": 6.7,
        "alcohol_test": 0,
        "peroxide_test": 0,
        "taste_score": 4,
        "aroma_score": 4,
        "texture_score": 4,
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
    payload = {"temperature": "invalid", "ph": 6.7}
    response = await client.post("/predict", json=payload)
    assert response.status_code == 422
