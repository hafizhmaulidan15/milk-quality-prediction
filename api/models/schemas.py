from pydantic import BaseModel, Field
from typing import List, Optional


class PredictRequest(BaseModel):
    storage_temp: float = Field(..., description="Suhu penyimpanan (°C)")
    ph: float = Field(..., ge=0, le=14, description="pH susu")
    storage_time: float = Field(..., description="Waktu simpan sejak pasteurisasi (jam)")
    pasteurization_temp: float = Field(..., description="Suhu pasteurisasi (°C)")
    tpc: Optional[float] = Field(None, description="Total Plate Count (CFU/mL)")
    grading_delta_hours: Optional[float] = Field(None, description="Delta waktu grading-produksi (jam)")
    shift: Optional[str] = Field(None, description="Shift produksi: Pagi/Siang/Malam")


class ShapFeature(BaseModel):
    feature: str
    shap_value: float


class PredictResponse(BaseModel):
    predicted_grade: str
    confidence: float
    probabilities: dict[str, float]
    top_features: list[ShapFeature]
    recommendation: str


class HealthResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    status: str
    model_loaded: bool
    model_type: Optional[str] = None
