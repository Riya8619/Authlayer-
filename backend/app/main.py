from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.history import router as history_router
from app.api.image_scan import router as image_router
from app.api.url_scan import router as url_router
from app.core.config import settings
from app.core.logging_config import configure_logging, logger
from app.database.database import check_database_connection, create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    logger.info("Starting %s in %s mode", settings.APP_NAME, settings.ENVIRONMENT)

    if not settings.HUGGINGFACE_API_KEY:
        logger.warning(
            "HUGGINGFACE_API_KEY is not set — AI text/image detection will be skipped."
        )
    if not settings.GOOGLE_SAFE_BROWSING_API_KEY:
        logger.warning(
            "GOOGLE_SAFE_BROWSING_API_KEY is not set — URL safety checks will be skipped."
        )

    if not check_database_connection():
        raise RuntimeError(
            "Could not connect to the database at startup. "
            "Verify DATABASE_URL is correct and the database is reachable."
        )

    create_tables()
    logger.info("Startup checks complete.")

    yield

    logger.info("Shutting down %s", settings.APP_NAME)


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "error": "Validation error", "detail": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "error": "Internal server error"},
    )


app.include_router(image_router)
app.include_router(url_router)
app.include_router(history_router)


@app.get("/")
def home():
    return {"status": "AuthLayer backend running"}


@app.get("/health")
def health():
    db_ok = check_database_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unreachable",
        "environment": settings.ENVIRONMENT,
    }
