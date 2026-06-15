import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dependencies import init_predictor
from routers import health, predict

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Milk Quality Prediction API")
    init_predictor()
    yield
    logger.info("Shutting down Milk Quality Prediction API")


app = FastAPI(
    title="Milk Quality Prediction API",
    description="API untuk prediksi grade kualitas susu pasteurisasi",
    version="2.0.0",
    lifespan=lifespan,
)

origins_str = os.getenv(
    "ALLOWED_ORIGINS",
    "https://milk-quality.vercel.app,http://localhost:3000",
)
origins = [o.strip() for o in origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(predict.router)
