import os
import logging
from ml.predictor import MilkQualityPredictor

logger = logging.getLogger(__name__)

_predictor: MilkQualityPredictor = None

API_DIR = os.path.dirname(os.path.abspath(__file__))


def _resolve_path(path: str) -> str:
    if os.path.isabs(path):
        return path
    return os.path.join(API_DIR, path)


def init_predictor():
    global _predictor
    model_path = _resolve_path(
        os.getenv("MODEL_PATH", "models/artifacts/rf_model_v1.pkl")
    )
    pipeline_path = _resolve_path(
        os.getenv("PIPELINE_PATH", "models/artifacts/preprocessing_pipeline.pkl")
    )

    _predictor = MilkQualityPredictor()

    if os.path.exists(model_path) and os.path.exists(pipeline_path):
        try:
            _predictor.load(model_path, pipeline_path)
            logger.info("Predictor initialized successfully")
        except Exception as e:
            logger.warning("Failed to load model: %s", e)
    else:
        logger.warning(
            "Model files not found. API running without ML model. "
            "Expect degraded mode."
        )


def get_predictor() -> MilkQualityPredictor:
    return _predictor
