# Milk Quality Prediction System

Prediksi grade kualitas susu pasteurisasi (**A / B / C / Reject**) berbasis machine learning.

[![CI - API](https://github.com/yourusername/milk-quality-prediction/actions/workflows/ci-api.yml/badge.svg)](https://github.com/yourusername/milk-quality-prediction/actions/workflows/ci-api.yml)
[![CI - Frontend](https://github.com/yourusername/milk-quality-prediction/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/yourusername/milk-quality-prediction/actions/workflows/ci-frontend.yml)

---

## Fitur

- **Prediksi Real-time**: Input 7 parameter produksi, dapatkan prediksi grade dalam <50ms
- **Explainable AI**: SHAP values menunjukkan fitur yang paling mempengaruhi prediksi
- **Dashboard Interaktif**: Visualisasi probabilitas tiap grade + rekomendasi actionable
- **Riwayat Prediksi**: Semua hasil tersimpan di browser, lengkap dengan statistik agregat
- **Dokumentasi API**: Swagger UI di `/docs`

## Struktur Repo

```
milk-quality-prediction/
├── api/                    # FastAPI backend with ML model
│   ├── main.py             # Entry point with CORS, middleware
│   ├── routers/            # /health dan /predict endpoints
│   ├── ml/                 # Pipeline & predictor dengan SHAP
│   ├── models/             # Pydantic schemas
│   └── train_model.py      # Training script
├── frontend/               # Next.js 14 App Router
│   └── src/
│       ├── app/            # Dashboard, Predict, History pages
│       └── components/     # UI components + animations
├── notebooks/              # Jupyter notebooks (EDA → SHAP)
├── data/sample/            # Sample CSV untuk testing
└── .github/workflows/      # CI/CD pipelines
```

## Quick Start

### 1. API (Backend)

```bash
cd api
pip install -r requirements.txt
python train_model.py
uvicorn main:app --reload --port 8000
```

Dokumentasi API: http://localhost:8000/docs

### 2. Frontend (Dashboard)

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Buka http://localhost:3000

### 3. Docker (Fullstack)

```bash
docker-compose up --build
```

## Deployment ke Production

### Render (API)

1. Fork / push repo ke GitHub
2. Buka [Render Dashboard](https://dashboard.render.com) → **New Web Service**
3. Hubungkan repo GitHub
4. Isi konfigurasi:
   - **Name**: `milk-quality-api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r api/requirements.txt && cd api && python train_model.py`
   - **Start Command**: `cd api && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
   - **Region**: Singapore (terdekat Indonesia)
5. Set Environment Variables:
   - `MODEL_PATH`: `./models/artifacts/rf_model_v1.pkl`
   - `PIPELINE_PATH`: `./models/artifacts/preprocessing_pipeline.pkl`
   - `ALLOWED_ORIGINS`: `https://milk-quality.vercel.app,http://localhost:3000`
   - `LOG_LEVEL`: `INFO`
6. Deploy ✅ → Dapat URL seperti `https://milk-quality-api.onrender.com`

### Vercel (Frontend)

1. Buka [Vercel Dashboard](https://vercel.com) → **Add New Project**
2. Import repo GitHub → pilih direktori `frontend/`
3. Framework otomatis terdeteksi: **Next.js**
4. Set Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://milk-quality-api.onrender.com`
5. Deploy ✅ → Dapat URL seperti `https://milk-quality.vercel.app`

### Update `ALLOWED_ORIGINS` di Render

Setelah frontend terdeploy, update env var `ALLOWED_ORIGINS` di Render:

```
ALLOWED_ORIGINS=https://milk-quality.vercel.app,http://localhost:3000
```

## API Endpoints

| Method | Path        | Deskripsi                         |
| ------ | ----------- | --------------------------------- |
| GET    | `/health`   | Health check + status model       |
| POST   | `/predict`  | Prediksi grade susu               |

### Contoh Request `/predict`

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
  "probabilities": { "A": 0.87, "B": 0.09, "C": 0.03, "Reject": 0.01 },
  "top_features": [
    { "feature": "ph", "shap_value": 0.34 },
    { "feature": "storage_temp", "shap_value": 0.28 }
  ],
  "recommendation": "Batch siap distribusi. Pantau suhu cold chain."
}
```

## Model Performance (Random Forest)

| Metrik           | Target | Hasil   | Keterangan                  |
| ---------------- | ------ | ------- | --------------------------- |
| F1 Weighted      | ≥ 0.85 | **0.92** | Overall performance         |
| F1 Grade A       | ≥ 0.88 | **0.91** | Premium quality             |
| F1 Grade B       | ≥ 0.80 | **0.93** | Layak konsumsi              |
| F1 Grade C       | ≥ 0.80 | **0.91** | Penanganan khusus           |
| F1 Reject        | ≥ 0.90 | **0.96** | Safety-critical             |
| Inference Time   | <200ms | **~15ms** | Real-time capable           |

## Notebooks

Semua notebook ada di direktori `notebooks/`:

| #  | Notebook             | Deskripsi                               |
| -- | -------------------- | --------------------------------------- |
| 1  | `01_eda.ipynb`       | EDA: distribusi, korelasi, outliers     |
| 2  | `02_preprocessing`   | Feature engineering + scaling           |
| 3  | `03_baseline_model`  | Logistic Regression + Random Forest     |
| 4  | `04_advanced_model`  | XGBoost + LightGBM + GridSearch         |
| 5  | `05_shap_analysis`   | SHAP explainability + domain validation |

Jalankan dengan:

```bash
cd notebooks && jupyter lab
```

## Environment Variables

### API (`api/.env`)

| Variable          | Default                                  | Required |
| ----------------- | ---------------------------------------- | -------- |
| `MODEL_PATH`      | `./models/artifacts/rf_model_v1.pkl`     | Ya       |
| `PIPELINE_PATH`   | `./models/artifacts/preprocessing_pipeline.pkl` | Ya |
| `ALLOWED_ORIGINS` | `http://localhost:3000`                  | Ya       |
| `LOG_LEVEL`       | `INFO`                                   | Tidak    |

### Frontend (`frontend/.env.local`)

| Variable               | Default                  | Required |
| ---------------------- | ------------------------ | -------- |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:8000`   | Ya       |

## Tech Stack

- **Backend**: Python 3.11, FastAPI, scikit-learn, XGBoost, SHAP
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Infra**: Docker, Render (API), Vercel (Frontend)
