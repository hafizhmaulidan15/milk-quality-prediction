import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, LabelEncoder


FEATURE_COLUMNS = [
    "storage_temp",
    "ph",
    "storage_time",
    "pasteurization_temp",
    "tpc",
    "grading_delta_hours",
    "shift_Pagi",
    "shift_Siang",
]


class FeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.label_encoders_ = {}

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        if "tpc" in X.columns:
            X["tpc"] = X["tpc"].fillna(X["tpc"].median())
        if "grading_delta_hours" in X.columns:
            X["grading_delta_hours"] = X["grading_delta_hours"].fillna(
                X["grading_delta_hours"].median()
            )
        if "shift" in X.columns:
            X["shift"] = X["shift"].fillna("Pagi")
        if "shift" in X.columns:
            X["shift_Pagi"] = (X["shift"] == "Pagi").astype(int)
            X["shift_Siang"] = (X["shift"] == "Siang").astype(int)
            X = X.drop(columns=["shift"])
        if "Malam" in X.columns:
            X = X.drop(columns=["shift_Malam"], errors="ignore")
        for col in FEATURE_COLUMNS:
            if col not in X.columns:
                X[col] = 0
        return X[FEATURE_COLUMNS]


def create_pipeline():
    return Pipeline([
        ("features", FeatureEngineer()),
        ("scaler", StandardScaler()),
    ])


GRADE_MAPPING = {"A": 0, "B": 1, "C": 2, "Reject": 3}
INVERSE_GRADE_MAPPING = {v: k for k, v in GRADE_MAPPING.items()}
