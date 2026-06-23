from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.history import router as history_router
from app.api.image_scan import router as image_router
from app.api.url_scan import router as url_router

app = FastAPI(title="AuthLayer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(image_router)
app.include_router(url_router)
app.include_router(history_router)


@app.get("/")
def home():
    return {"status": "AuthLayer backend running"}
