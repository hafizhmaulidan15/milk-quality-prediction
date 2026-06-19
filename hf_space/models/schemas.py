from pydantic import BaseModel, Field
from typing import Optional


class PredictRequest(BaseModel):
    temperature: float = Field(..., description="Suhu pengecekan (°C)")
    fat: float = Field(..., ge=0, description="Kadar lemak (%)")
    snf: float = Field(..., ge=0, description="Solid Non Fat (%)")
    protein: float = Field(..., ge=0, description="Kadar protein (%)")
    lactose: float = Field(..., ge=0, description="Kadar laktosa (%)")
    salt: float = Field(..., ge=0, description="Kadar garam (%)")
    total_solid: float = Field(..., ge=0, description="Total padatan (%)")
    density: float = Field(..., ge=0, description="Berat jenis (g/mL)")
    added_water: float = Field(..., ge=0, description="Air tambahan (%)")
    freezing_point: float = Field(..., description="Titik beku (°C)")
    ph: float = Field(..., ge=0, le=14, description="pH susu")
    alcohol_test: int = Field(..., ge=0, le=1, description="Tes alkohol 70%: 0=tidak pecah, 1=pecah")
    peroxide_test: int = Field(..., ge=0, le=1, description="Tes peroksida: 0=negatif, 1=positif")
    taste_score: int = Field(..., ge=1, le=5, description="Skor rasa (1-5)")
    aroma_score: int = Field(..., ge=1, le=5, description="Skor aroma (1-5)")
    texture_score: int = Field(..., ge=1, le=5, description="Skor tekstur (1-5)")


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
