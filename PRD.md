# PRD: Milk Quality Prediction System
> **Version** 3.0 · **Last Updated** Juni 2026

---

## 1. Ringkasan Eksekutif

Model ML untuk mengklasifikasikan grade susu **segar** (A / B / C / Reject) berdasarkan parameter **Lactosan** + **Organoleptik** secara real-time. Sistem terdiri dari tiga layer:

| Layer | Komponen | Deploy Target |
|---|---|---|
| **ML Core** | Training pipeline, Random Forest, SHAP | HuggingFace Spaces (Docker) |
| **API** | FastAPI REST endpoint | HuggingFace Spaces |
| **Frontend** | Next.js dashboard + history | Vercel |
| **Database** | Supabase (persist prediction history) | Supabase Cloud |

> **Nilai strategis:** Prediksi real-time tanpa nunggu lab, batch grading, riwayat tersimpan di cloud.

---

## 2. Problem Statement

### Sebelum
```
Produksi → Sample dikirim lab → Tunggu 4-8 jam → Hasil QC → Tindakan
```

### Sesudah
```
Masukkan parameter → Prediksi instan → Grade + confidence + rekomendasi
```

### Pain Points
- **Reaktif**: keputusan baru bisa diambil setelah hasil lab keluar
- **Biaya**: setiap sample lab mahal → model bantu filter prioritasi
- **Tidak ada baseline**: belum pernah ada data korelasi parameter ↔ grade

---

## 3. Scope & Out of Scope

### In Scope
- Klasifikasi grade susu **segar** (raw milk, **bukan pasteurisasi**)
- Input: 16 parameter Lactosan + organoleptik + pH + alkohol + peroksida
- Output: grade + confidence + probabilitas + top SHAP features + rekomendasi
- Dashboard web glassmorphism dark/light mode
- History prediksi persist di Supabase (cloud)
- PWA (installable)

### Out of Scope
- Analisis gambar / computer vision
- Integrasi IoT sensor langsung
- Multi-produk (keju, yogurt)
- Multi-bahasa

---

## 4. Dataset

### Sumber Data
| Sumber | Format | Status |
|---|---|---|
| Synthetic (domain scoring rules) | Python generated | ⬜ Digunakan untuk MVP (3.000 rows) |
| Data produksi asli (belum ada) | CSV | ❌ Akan diganti ketika tersedia |

### Features (16 parameter)

#### Lactosan (9)
| Fitur | Satuan | Range Normal |
|---|---|---|
| Suhu Pengecekan | °C | 2–10 |
| Lemak (Fat) | % | 2–7 |
| Solid Non Fat (SNF) | % | 7–10 |
| Protein | % | 2.5–4.5 |
| Laktosa | % | 3.5–5.5 |
| Garam | % | 0.05–0.25 |
| Total Solid | % | 10–15 |
| Density | g/mL | 1.025–1.035 |
| Air Tambahan | % | 0–10 |
| Titik Beku | °C | -0.570 – -0.510 |

#### Organoleptik (3)
| Fitur | Skala |
|---|---|
| Rasa | 1–5 |
| Aroma | 1–5 |
| Tekstur | 1–5 |

#### Lainnya (4)
| Fitur | Nilai |
|---|---|
| pH | 6.0–7.0 |
| Tes Alkohol 70% | 0 (Negatif) / 1 (Positif) |
| Tes Peroksida | 0 (Negatif) / 1 (Positif) |

### Target (y)
```
Grade A  → Premium, lolos semua parameter SNI
Grade B  → Layak konsumsi, deviasi minor
Grade C  → Perlu penanganan khusus / blending
Reject   → TIDAK LAYAK
```

### Volume Data
| Kondisi | Jumlah | Strategy |
|---|---|---|
| MVP (sekarang) | 3.000 synthetic | Random Forest |
| Production target | ≥ 2.000 asli | Ganti synthetic → real data |

---

## 5. Model ML

### Algoritma Terpilih: **Random Forest Classifier**

### Metrik Saat Ini (Synthetic Data)
| Metrik | Score |
|---|---|
| F1 (weighted) | 0.78 |
| F1 Grade A | 0.91 |
| F1 Grade B | 0.68 |
| F1 Grade C | 0.54 |
| F1 Reject | 0.88 |
| ROC-AUC (macro) | 0.92 |

> **Catatan:** Performa akan meningkat signifikan dengan data produksi asli.

### Output API
```json
{
  "predicted_grade": "B",
  "confidence": 0.6513,
  "probabilities": { "A": 0.082, "B": 0.651, "C": 0.229, "Reject": 0.038 },
  "top_features": [
    { "feature": "added_water", "shap_value": 0.0965 },
    { "feature": "alcohol_test", "shap_value": 0.0649 },
    { "feature": "total_solid", "shap_value": 0.0555 }
  ],
  "recommendation": "Batch layak konsumsi dengan deviasi minor. Confidence rendah - disarankan konfirmasi lab."
}
```

---

## 6. Tech Stack

### Frontend (Vercel)
| Package | Fungsi |
|---|---|
| `next` 14.x | App Router |
| `tailwindcss` 3.x | Utility CSS |
| `framer-motion` | Animasi scroll reveal |
| `recharts` | Chart grade distribution + trend line |
| `@fortawesome/react-fontawesome` | Icons (free solid) |
| `@supabase/supabase-js` | Database client |
| `sonner` | Toast notifications |

### API (HuggingFace Spaces)
| Package | Fungsi |
|---|---|
| `fastapi` | REST API |
| `scikit-learn` | Random Forest + preprocessing |
| `shap` | Feature importance |
| `pandas` | Data handling |
| `pydantic` | Schema validation |
| `joblib` | Model serialization |

### Infrastructure
| Tool | Fungsi |
|---|---|
| **Vercel** | Frontend hosting |
| **HuggingFace Spaces** | API Docker deployment |
| **Supabase** | Prediction history database |
| **GitHub** | Source control |

---

## 7. Repo Structure

```
milk-quality-prediction/
├── 📁 frontend/                    # Next.js → Vercel
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Dashboard bento-grid
│   │   │   ├── predict/page.tsx    # Form 16 parameter
│   │   │   └── history/page.tsx    # Riwayat (dari Supabase)
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Nav + theme toggle
│   │   │   ├── PredictionResult.tsx# Hasil prediksi
│   │   │   └── LoadingSkeleton.tsx # Skeleton loading
│   │   └── lib/
│   │       ├── api.ts              # API client + constants
│   │       └── supabase.ts         # Supabase client
│   ├── public/
│   │   ├── icon.svg                # PWA icon
│   │   ├── manifest.json           # PWA manifest
│   │   └── sw.js                   # Service worker
│   ├── .env.local
│   └── package.json
│
├── 📁 api/                         # FastAPI → HF Spaces
│   ├── main.py                     # Entry point
│   ├── routers/
│   │   ├── predict.py              # POST /predict
│   │   └── health.py               # GET /health
│   ├── models/
│   │   ├── schemas.py              # Pydantic schemas (16 params)
│   │   └── artifacts/              # .pkl files
│   ├── ml/
│   │   ├── pipeline.py             # FeatureEngineer + scaler
│   │   └── predictor.py            # Inference + SHAP
│   ├── train_model.py              # Training script
│   ├── requirements.txt
│   └── Dockerfile
│
├── 📁 notebooks/                   # Jupyter
│   ├── 01_eda.ipynb
│   ├── 02_preprocessing.ipynb
│   ├── 03_baseline_model.ipynb
│   ├── 04_advanced_model.ipynb
│   └── 05_shap_analysis.ipynb
│
├── 📁 data/
│   └── sample/
│       └── sample_input.csv        # 50 rows demo
│
├── 📁 hf_space/                    # Mirror api/ untuk HF Spaces
│
├── ML-Quality-Prediction-PRD-v3.md
└── README.md
```

---

## 8. Deliverables

### Completed (/)
| # | Output | Status |
|---|---|---|
| 1 | EDA + preprocessing notebooks | ✅ |
| 2 | Model training + cross-validation | ✅ RF, eval |
| 3 | SHAP analysis | ✅ |
| 4 | Model artifact (.pkl) | ✅ |
| 5 | REST API /predict + /health | ✅ Live |
| 6 | Frontend dashboard glassmorphism | ✅ Live |
| 7 | Dark/light mode toggle | ✅ |
| 8 | Input validation (range warnings) | ✅ |
| 9 | PWA installable | ✅ |
| 10 | Supabase prediction history | ✅ |
| 11 | Light/dark theme toggle | ✅ |
| 12 | Trend chart (grade over time) | ✅ |
| 13 | Font Awesome icons | ✅ |

### Pending
| # | Output | Prioritas |
|---|---|---|
| 1 | Ganti synthetic data pake data asli | P0 |
| 2 | Auth (Supabase Auth, per-user history) | P1 |
| 3 | Batch predict (upload CSV) | P1 |
| 4 | Export CSV | P2 |

---

## 9. Deployment Architecture

```
┌──────────────────────────────────────────┐
│            Browser (User)                │
│   PWA installable · Dark/Light mode     │
└────────────────┬─────────────────────────┘
                 │ HTTPS
                 ▼
┌──────────────────────────────────────────┐
│  Vercel (Frontend)                      │
│  milk-quality-prediction.vercel.app     │
│  Next.js 14 · Tailwind · Framer Motion  │
└────────────────┬─────────────────────────┘
                 │ POST /predict
                 ▼
┌──────────────────────────────────────────┐
│  HuggingFace Spaces (API)               │
│  hafizhmaull-milk-quality-prediction    │
│  FastAPI · Random Forest · SHAP         │
└──────────────┬───────────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌────────────┐  ┌──────────────┐
│ Model .pkl │  │  Supabase    │
│ (in image) │  │  Predictions │
└────────────┘  └──────────────┘
```

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://hafizhmaull-milk-quality-prediction.hf.space
NEXT_PUBLIC_SUPABASE_URL=https://qplipeaquxvoyclhicvy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**API (HF Spaces Secrets):**
```env
ALLOWED_ORIGINS=https://milk-quality-prediction.vercel.app
LOG_LEVEL=INFO
```

---

## 10. Milestone (Done)

```
FASE 1 — Dataset & EDA            ✅
  Synthetic 3.000 rows, 5 notebooks

FASE 2 — Model                    ✅
  Random Forest, F1 weighted 0.78, Reject 0.88

FASE 3 — API + Deploy             ✅
  FastAPI → HF Spaces, Frontend → Vercel

FASE 4 — UI Upgrade               ✅
  Glassmorphism, dark/light, PWA, Supabase

FASE 5 — Icons                    ✅
  Lucide → Font Awesome
```

---

## 11. Success Criteria

### Model
- [x] F1 weighted ≥ 0.78 (target 0.85 dengan data asli)
- [x] F1 Reject ≥ 0.88 (safety-critical)
- [x] Inference < 200ms
- [x] Zero error pada sample input

### Frontend
- [x] Build sukses tanpa error
- [x] Semua halaman responsif
- [x] Prediksi real-time
- [x] History persist di cloud
- [x] PWA installable
- [x] Dark/light mode

### Dokumentasi
- [x] README
- [x] PRD v3
- [x] Sample input

---

## 12. Risks & Mitigasi

| Risk | Dampak | Mitigasi |
|---|---|---|
| Data asli belum ada | Model trained on synthetic → akurasi terbatas | Prioritaskan pengumpulan data produksi |
| Cold start HF Spaces | Prediksi pertama lambat (~5-10s) | Gunakan keep-alive atau upgrade hardware |
| Synthetic data bias | Feature importance tidak real | Validasi dengan domain expert |
| Tidak ada auth | History gabung semua user | Tambah Supabase Auth nanti |
| No offline mode | Butuh koneksi internet | PWA cache strategi nanti |

---

*PRD v3 — Living document, update sesuai perkembangan.*
