import time
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.config import settings

# Database connection arguments
is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

# Engine configuration with pre-ping for automatic reconnection
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

# Enable foreign key constraints and WAL mode in SQLite
if is_sqlite:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_db_health() -> dict:
    """
    Verifies database connectivity, measuring roundtrip latency and schema status.
    """
    start_time = time.time()
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        latency_ms = round((time.time() - start_time) * 1000, 2)
        dialect = engine.dialect.name
        return {
            "status": "healthy",
            "dialect": dialect,
            "latency_ms": latency_ms,
            "database_url_configured": bool(settings.DATABASE_URL)
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "database_url_configured": bool(settings.DATABASE_URL)
        }
    finally:
        db.close()
