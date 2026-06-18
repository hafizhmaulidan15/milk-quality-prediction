import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

FEATURE_COLUMNS = [
    "temperature",
    "fat",
    "snf",
    "protein",
    "lactose",
    "total_solid",
    "density",
    "freezing_point",
    "added_water",
    "ph",
    "alcohol_test",
    "peroxide_test",
    "taste_score",
    "aroma_score",
    "texture_score",
    "pasteurization_temp",
    "storage_temp",
    "storage_time",
]

NUMERIC_FEATURES = [
    "temperature", "fat", "snf", "protein", "lactose",
    "total_solid", "density", "freezing_point", "added_water",
    "ph", "pasteurization_temp", "storage_temp", "storage_time",
]

BINARY_FEATURES = ["alcohol_test", "peroxide_test"]

ORDINAL_FEATURES = ["taste_score", "aroma_score", "texture_score"]


class FeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.medians_ = {}

    def fit(self, X, y=None):
        for col in NUMERIC_FEATURES:
            if col in X.columns:
                self.medians_[col] = X[col].median()
        return self

    def transform(self, X):
        X = X.copy()
        for col in self.medians_:
            if col in X.columns:
                X[col] = X[col].fillna(self.medians_[col])
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
