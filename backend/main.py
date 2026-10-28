from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.database import Base, engine, SessionLocal
from backend.services.demo_data import seed_demo_data

from backend.routers import (
    auth, courses, notes, resources, comments, ai_tutor,
    flashcards, quizzes, active_learning, study_sessions,
    activity, planner, tasks, revision, goals, journal,
    search, notifications, backup
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    Base.metadata.create_all(bind=engine)
    # Check if we should seed default demo data on first boot if DB is fresh
    db = SessionLocal()
    try:
        from backend.models import Course
        if db.query(Course).count() == 0:
            seed_demo_data(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="A private, Moodle-inspired personal Learning Management System for focused learning, understanding, and practice.",
    lifespan=lifespan
)

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        "version": settings.PROJECT_VERSION
    }

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
