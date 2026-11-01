from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from backend.config import settings, is_serverless
from backend.database import Base, engine, SessionLocal, ensure_db_initialized
from backend.services.demo_data import seed_demo_data

from backend.routers import (
    auth, courses, notes, resources, comments, ai_tutor,
    flashcards, quizzes, active_learning, study_sessions,
    activity, planner, tasks, revision, goals, journal,
    search, notifications, backup
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Idempotent lazy initialization handles tables and demo seed
    ensure_db_initialized()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="A private, Moodle-inspired personal Learning Management System for focused learning, understanding, and practice.",
    lifespan=lifespan
)

# CORS setup restricted to approved origins
approved_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://lms-yrpn.vercel.app",
]
if settings.ALLOWED_ORIGINS:
    for origin in settings.ALLOWED_ORIGINS.split(","):
        origin_clean = origin.strip()
        if origin_clean and origin_clean not in approved_origins:
            approved_origins.append(origin_clean)

app.add_middleware(
    CORSMiddleware,
    allow_origins=approved_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global standardized error response handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log exception for server inspection
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc) or "Internal server error", "path": request.url.path}
    )

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include API routers
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(notes.router)
app.include_router(resources.router)
app.include_router(comments.router)
app.include_router(ai_tutor.router)
app.include_router(flashcards.router)
app.include_router(quizzes.router)
app.include_router(active_learning.router)
app.include_router(study_sessions.router)
app.include_router(activity.router)
app.include_router(planner.router)
app.include_router(tasks.router)
app.include_router(revision.router)
app.include_router(goals.router)
app.include_router(journal.router)
app.include_router(search.router)
app.include_router(notifications.router)
app.include_router(backup.router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "persistence": "ephemeral" if settings.is_ephemeral_storage else "persistent",
        "database_type": "sqlite" if settings.DATABASE_URL.startswith("sqlite") else "postgresql",
        "serverless": is_serverless
    }

@app.get("/")
@app.get("/index.html")
@app.get("/api")
@app.get("/api/")
@app.get("/api/index")
@app.get("/api/index.py")
def root_handler(request: Request):
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        return RedirectResponse(url="https://lms-yrpn.vercel.app/", status_code=307)
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "docs_url": "/docs",
        "health_url": "/health",
        "frontend_url": "https://lms-yrpn.vercel.app/",
        "endpoints": [
            "/api/courses",
            "/api/notes",
            "/api/resources",
            "/api/ai/chat",
            "/api/flashcards",
            "/api/quizzes",
            "/api/study-sessions",
            "/api/activity",
            "/api/tasks",
            "/api/goals",
            "/health"
        ]
    }

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
