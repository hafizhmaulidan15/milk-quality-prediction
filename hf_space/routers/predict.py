from fastapi import APIRouter, HTTPException
from models.schemas import PredictRequest, PredictResponse, ShapFeature
from ml.predictor import MilkQualityPredictor
from dependencies import get_predictor

router = APIRouter(tags=["Prediction"])


@router.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    predictor: MilkQualityPredictor = get_predictor()
    if predictor.model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    try:
        input_data = request.model_dump()
        result = predictor.predict(input_data)
        return PredictResponse(
            predicted_grade=result["predicted_grade"],
            confidence=result["confidence"],
            probabilities=result["probabilities"],
            top_features=[
                ShapFeature(**f) for f in result["top_features"]
            ],
            recommendation=result["recommendation"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
