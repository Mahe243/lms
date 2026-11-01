import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import settings

# SQLite connection args to support foreign keys and multithreading
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

# Enable foreign key constraints in SQLite
if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        try:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            # WAL mode requires writable local filesystem; skip in serverless/tmp environments if problematic
            if not (os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME")):
                cursor.execute("PRAGMA journal_mode=WAL")
            cursor.close()
        except Exception:
            pass

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

import threading
import logging

logger = logging.getLogger(__name__)

_db_init_lock = threading.Lock()
_db_initialized = False

def ensure_db_initialized():
    """
    Thread-safe, idempotent lazy database initialization.
    Runs once per process on the first database call or lifespan startup.
    Guarantees that tables and seed data exist even on serverless runtimes
    where ASGI lifespan hooks may not execute.
    """
    global _db_initialized
    if _db_initialized:
        return
    with _db_init_lock:
        if _db_initialized:
            return
        try:
            # Ensure all model tables are registered with Base.metadata
            import backend.models  # noqa: F401
            Base.metadata.create_all(bind=engine)
            
            if settings.is_ephemeral_storage:
                logger.warning(
                    "[Learnova Persistence Warning] Running with ephemeral SQLite storage (%s). "
                    "Data will reset on instance cold starts. Configure DATABASE_URL (e.g. Neon or Supabase PostgreSQL) for durable storage.",
                    settings.DATABASE_URL
                )

            db = SessionLocal()
            try:
                from backend.models import Course
                if db.query(Course).count() == 0:
                    from backend.services.demo_data import seed_demo_data
                    seed_demo_data(db)
            finally:
                db.close()
        except Exception as e:
            logger.error(f"[Learnova DB Init] Error during lazy database initialization: {e}")
        _db_initialized = True

def get_db():
    ensure_db_initialized()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
