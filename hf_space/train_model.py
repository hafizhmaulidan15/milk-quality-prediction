"""
Training script for Milk Quality Prediction Model.
Generates synthetic dataset based on domain knowledge, trains a Random Forest,
and saves model + pipeline artifacts for the API.
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    f1_score,
)
import joblib

sys.path.insert(0, os.path.dirname(__file__))
from ml.pipeline import create_pipeline, GRADE_MAPPING, INVERSE_GRADE_MAPPING

np.random.seed(42)

N_SAMPLES = 2000


def generate_synthetic_data(n=N_SAMPLES):
    data = {
        "storage_temp": np.random.normal(5.0, 1.5, n),
        "ph": np.random.normal(6.7, 0.3, n),
        "storage_time": np.random.exponential(24, n),
        "pasteurization_temp": np.random.normal(72.0, 3.0, n),
        "tpc": np.random.lognormal(8, 1.5, n),
        "grading_delta_hours": np.random.exponential(3, n),
        "shift": np.random.choice(["Pagi", "Siang", "Malam"], n),
    }
    df = pd.DataFrame(data)

    conditions = [
        (df["ph"] >= 6.6) & (df["ph"] <= 6.8)
        & (df["storage_temp"] <= 6.0)
        & (df["storage_time"] <= 24)
        & (df["tpc"] <= 50000)
        & (df["pasteurization_temp"] >= 70),
        (df["ph"] >= 6.4) & (df["ph"] <= 7.0)
        & (df["storage_temp"] <= 8.0)
        & (df["storage_time"] <= 48)
        & (df["tpc"] <= 100000)
        & (df["pasteurization_temp"] >= 68),
        (df["ph"] >= 6.2) & (df["ph"] <= 7.2)
        & (df["storage_temp"] <= 10.0)
        & (df["storage_time"] <= 72)
        & (df["tpc"] <= 500000),
    ]
    grades = ["A", "B", "C"]
    df["grade"] = np.select(conditions, grades, default="Reject")

    noise_mask = np.random.random(n) < 0.08
    if noise_mask.any():
        shuffled = df["grade"].sample(frac=1, random_state=1).values
        df.loc[noise_mask, "grade"] = shuffled[noise_mask]

    grade_counts = df["grade"].value_counts()
    print("Generated grade distribution:")
    for g in ["A", "B", "C", "Reject"]:
        print(f"  {g}: {grade_counts.get(g, 0)} ({grade_counts.get(g, 0)/n*100:.1f}%)")

    return df


def main():
    print("=" * 60)
    print("Milk Quality Prediction - Model Training")
    print("=" * 60)

    df = generate_synthetic_data()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sample_path = os.path.join(script_dir, "..", "data", "sample", "sample_input.csv")
    os.makedirs(os.path.dirname(sample_path), exist_ok=True)
    df.head(20).to_csv(sample_path, index=False)
    print(f"\nSample data saved to {sample_path}")

    y = df["grade"].map(GRADE_MAPPING)
    X = df.drop(columns=["grade"])

    pipeline = create_pipeline()
    X_processed = pipeline.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_processed, y, test_size=0.2, random_state=42, stratify=y
    )

    print("\nTraining Random Forest...")
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_leaf=4,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    f1 = f1_score(y_test, y_pred, average="weighted")

    print(f"\nWeighted F1 Score: {f1:.4f}")
    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            y_pred,
            target_names=list(INVERSE_GRADE_MAPPING.values()),
            zero_division=0,
        )
    )

    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    labels = list(INVERSE_GRADE_MAPPING.values())
    print("       " + " ".join(f"{l:>8}" for l in labels))
    for i, row in enumerate(cm):
        print(f"{labels[i]:>6} " + " ".join(f"{v:>8}" for v in row))

    artifacts_dir = os.path.join(script_dir, "models", "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)

    model_path = os.path.join(artifacts_dir, "rf_model_v1.pkl")
    pipeline_path = os.path.join(artifacts_dir, "preprocessing_pipeline.pkl")

    joblib.dump(model, model_path)
    joblib.dump(pipeline, pipeline_path)

    print(f"\nModel saved     : {model_path}")
    print(f"Pipeline saved  : {pipeline_path}")
    print("\nTraining complete!")


if __name__ == "__main__":
    main()
