import os
import logging
import joblib
import numpy as np
import pandas as pd
import shap
from typing import Optional

from ml.pipeline import create_pipeline, INVERSE_GRADE_MAPPING, FEATURE_COLUMNS

logger = logging.getLogger(__name__)


class MilkQualityPredictor:
    def __init__(
        self,
        model_path: Optional[str] = None,
        pipeline_path: Optional[str] = None,
    ):
        self.model = None
        self.pipeline = None
        self.model_type = None
        self.explainer = None
        if model_path and pipeline_path:
            self.load(model_path, pipeline_path)

    def load(self, model_path: str, pipeline_path: str):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")
        if not os.path.exists(pipeline_path):
            raise FileNotFoundError(f"Pipeline not found: {pipeline_path}")
        self.model = joblib.load(model_path)
        self.pipeline = joblib.load(pipeline_path)
        self.model_type = type(self.model).__name__

        background = pd.DataFrame(
            np.random.randn(100, len(FEATURE_COLUMNS)),
            columns=FEATURE_COLUMNS,
        )
        try:
            self.explainer = shap.TreeExplainer(self.model, background)
        except Exception:
            try:
                self.explainer = shap.Explainer(self.model, background)
            except Exception:
                self.explainer = None

        logger.info(
            "Model loaded: %s | model_type=%s",
            model_path,
            self.model_type,
        )

    def predict(self, input_data: dict) -> dict:
        if self.model is None or self.pipeline is None:
            raise RuntimeError("Model not loaded. Call load() first.")

        df = pd.DataFrame([input_data])
        X_processed = self.pipeline.transform(df)
        proba = self.model.predict_proba(X_processed)[0]
        pred_idx = int(np.argmax(proba))
        confidence = float(np.max(proba))
        predicted_grade = INVERSE_GRADE_MAPPING.get(pred_idx, "Unknown")
        probabilities = {
            INVERSE_GRADE_MAPPING.get(i, f"Class_{i}"): float(p)
            for i, p in enumerate(proba)
        }
        top_features = self._get_shap_values(X_processed)
        recommendation = self._generate_recommendation(
            predicted_grade, confidence, top_features
        )

        return {
            "predicted_grade": predicted_grade,
            "confidence": round(confidence, 4),
            "probabilities": probabilities,
            "top_features": top_features,
            "recommendation": recommendation,
        }

    def _get_shap_values(self, X_processed: np.ndarray) -> list:
        if self.explainer is None:
            return [
                {"feature": f, "shap_value": 0.0} for f in FEATURE_COLUMNS[:3]
            ]
        try:
            shap_values = self.explainer(X_processed)
            if hasattr(shap_values, "values"):
                vals = shap_values.values[0]
                if vals.ndim > 1:
                    vals = vals.max(axis=1)
                idx = np.argsort(np.abs(vals))[-5:][::-1]
            else:
                vals = np.zeros(len(FEATURE_COLUMNS))
                idx = range(min(3, len(FEATURE_COLUMNS)))
            return [
                {"feature": FEATURE_COLUMNS[i], "shap_value": round(float(vals[i]), 4)}
                for i in idx
            ]
        except Exception as e:
            logger.warning("SHAP computation failed: %s", e)
            return [
                {"feature": f, "shap_value": 0.0} for f in FEATURE_COLUMNS[:3]
            ]

    def _generate_recommendation(
        self, grade: str, confidence: float, top_features: list
    ) -> str:
        recommendations = {
            "A": "Batch siap distribusi. Pantau suhu cold chain.",
            "B": "Batch layak konsumsi dengan deviasi minor. Evaluasi parameter proses.",
            "C": "Batch perlu penanganan khusus / blending. Review parameter produksi.",
            "Reject": "Batch TIDAK LAYAK. Hentikan distribusi dan lakukan investigasi.",
        }
        base = recommendations.get(grade, "Lakukan pengecekan manual.")
        if confidence < 0.7:
            base += " Confidence rendah - disarankan konfirmasi lab."
        return base
