from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from routers import export, health, judge, limits, ocr  # noqa: E402
from services import limits_service  # noqa: E402


@asynccontextmanager
async def lifespan(app: FastAPI):
    limits_service.ensure_initialized()
    yield


app = FastAPI(title="QUEST RE Judge API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(limits.router)
app.include_router(ocr.router)
app.include_router(judge.router)
app.include_router(export.router)
