---
title: Milk Quality Prediction
emoji: 🥛
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# 🥛 Milk Quality Prediction

Prediksi grade kualitas susu pasteurisasi (**A / B / C / Reject**) berbasis machine learning.

## API Documentation

**GET** `/health` — Health check

**POST** `/predict` — Prediksi grade susu

### Contoh Request

```json
{
  "storage_temp": 4.5,
  "ph": 6.7,
  "storage_time": 12.0,
  "pasteurization_temp": 72.0,
  "tpc": 50000,
  "grading_delta_hours": 2.0,
  "shift": "Pagi"
}
```

### Response

```json
{
  "predicted_grade": "A",
  "confidence": 0.87,
  "probabilities": {
    "A": 0.87, "B": 0.09, "C": 0.03, "Reject": 0.01
  },
  "top_features": [
    { "feature": "ph", "shap_value": 0.34 },
    { "feature": "storage_temp", "shap_value": 0.28 }
  ],
  "recommendation": "Batch siap distribusi. Pantau suhu cold chain."
}
```

Dibangun dengan FastAPI + scikit-learn + SHAP.
