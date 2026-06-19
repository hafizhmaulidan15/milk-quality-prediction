import os
import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, f1_score
import joblib

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ml.pipeline import create_pipeline, GRADE_MAPPING, INVERSE_GRADE_MAPPING, FEATURE_COLUMNS

np.random.seed(42)
N_SAMPLES = 3000


def generate_synthetic_data(n=N_SAMPLES):
    data = {
        "temperature": np.random.normal(5.0, 1.2, n).clip(0, 10),
        "fat": np.random.normal(4.0, 0.8, n).clip(1.5, 7.0),
        "snf": np.random.normal(8.8, 0.5, n).clip(7.0, 10.5),
        "protein": np.random.normal(3.2, 0.4, n).clip(2.2, 4.5),
        "lactose": np.random.normal(4.7, 0.3, n).clip(3.5, 5.5),
        "salt": np.random.normal(0.15, 0.04, n).clip(0.05, 0.3),
        "total_solid": np.random.normal(12.8, 1.0, n).clip(10.0, 16.0),
        "density": np.random.normal(1.030, 0.003, n).clip(1.026, 1.036),
        "added_water": np.random.exponential(1.0, n).clip(0, 10),
        "freezing_point": np.random.normal(-0.540, 0.010, n).clip(-0.570, -0.510),
        "ph": np.random.normal(6.7, 0.15, n).clip(6.3, 7.0),
        "alcohol_test": np.random.choice([0, 1], n, p=[0.88, 0.12]),
        "peroxide_test": np.random.choice([0, 1], n, p=[0.95, 0.05]),
        "taste_score": np.clip(np.round(np.random.normal(4, 0.8, n)), 1, 5).astype(int),
        "aroma_score": np.clip(np.round(np.random.normal(4, 0.8, n)), 1, 5).astype(int),
        "texture_score": np.clip(np.round(np.random.normal(4, 0.8, n)), 1, 5).astype(int),
    }
    df = pd.DataFrame(data)

    df["total_solid"] = df["fat"] + df["snf"] + df["salt"]

    quality_score = (
        (df["ph"] >= 6.6).astype(float) * 2
        + (df["ph"] <= 6.8).astype(float) * 2
        + (df["fat"] >= 4.0).astype(float) * 2
        + (df["snf"] >= 9.0).astype(float) * 2
        + (df["protein"] >= 3.2).astype(float) * 2
        + (df["added_water"] <= 1).astype(float) * 3
        + (df["density"] >= 1.030).astype(float) * 1.5
        + (df["freezing_point"] <= -0.535).astype(float) * 1.5
        + (df["alcohol_test"] == 0).astype(float) * 4
        + (df["peroxide_test"] == 0).astype(float) * 4
        + (df["taste_score"] >= 4).astype(float) * 1.5
        + (df["aroma_score"] >= 4).astype(float) * 1.5
        + (df["texture_score"] >= 4).astype(float) * 1.5
        + (df["temperature"] <= 6).astype(float) * 1
        + (df["salt"] >= 0.12).astype(float) * 1
    )

    def assign_grade(row, score):
        if row["alcohol_test"] == 1 or row["peroxide_test"] == 1:
            return "Reject"
        if row["taste_score"] <= 1 or row["aroma_score"] <= 1 or row["texture_score"] <= 1:
            return "Reject"
        if row["ph"] < 6.3 or row["ph"] > 7.0:
            return "Reject"
        if row["added_water"] > 10:
            return "Reject"
        if score >= 22:
            return "A"
        if score >= 17:
            return "B"
        if score >= 12:
            return "C"
        return "Reject"

    df["grade"] = df.apply(lambda r: assign_grade(r, quality_score.loc[r.name]), axis=1)

    noise_mask = np.random.random(n) < 0.08
    if noise_mask.any():
        grades = ["A", "B", "C", "Reject"]
        probs = [0.25, 0.3, 0.3, 0.15]
        df.loc[noise_mask, "grade"] = np.random.choice(grades, size=noise_mask.sum(), p=probs)

    grade_counts = df["grade"].value_counts()
    print("Generated grade distribution:")
    for g in ["A", "B", "C", "Reject"]:
        print(f"  {g}: {grade_counts.get(g, 0)} ({grade_counts.get(g, 0)/n*100:.1f}%)")

    return df


def main():
    print("=" * 60)
    print("Milk Quality Prediction - Model Training v2")
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
        n_estimators=200,
        max_depth=14,
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
