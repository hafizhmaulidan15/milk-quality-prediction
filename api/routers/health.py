from fastapi import APIRouter
from models.schemas import HealthResponse
from ml.predictor import MilkQualityPredictor
from dependencies import get_predictor

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    predictor: MilkQualityPredictor = get_predictor()
    model_loaded = predictor.model is not None
    return HealthResponse(
        status="ok" if model_loaded else "degraded",
        model_loaded=model_loaded,
        model_type=predictor.model_type if model_loaded else None,
    )
