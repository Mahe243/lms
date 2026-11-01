import os
import sys
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Detect serverless environment (Vercel, AWS Lambda, Google Cloud Run)
is_serverless = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))

def get_database_url() -> str:
    raw_url = os.getenv("DATABASE_URL")
    if raw_url:
        if raw_url.startswith("postgres://"):
            return raw_url.replace("postgres://", "postgresql://", 1)
        return raw_url
    if is_serverless:
        return "sqlite:////tmp/lms.db"
    return f"sqlite:///{BASE_DIR / 'lms.db'}"

class Settings:
    PROJECT_NAME: str = "Personal LMS"
    PROJECT_VERSION: str = "1.0.0"
    DATABASE_URL: str = get_database_url()
    UPLOAD_DIR: Path = Path("/tmp/uploads") if is_serverless else (BASE_DIR / "uploads")
    BACKUP_DIR: Path = Path("/tmp/backups") if is_serverless else (BASE_DIR / "backups")
    
    # Access Protection & Security
    LEARNOVA_ACCESS_TOKEN: str = os.getenv("LEARNOVA_ACCESS_TOKEN", "learnova_personal_secret")
    REQUIRE_AUTH: bool = os.getenv("REQUIRE_AUTH", "false").lower() in ("true", "1", "yes")
    
    # AI Provider Settings (Server-side secrets - NEVER exposed to browser)
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")
    
    # Study Settings
    STREAK_MIN_MINUTES: int = 15
    IDLE_TIMEOUT_MINUTES: int = 30
    DEFAULT_POMODORO_WORK_MINS: int = 25
    DEFAULT_POMODORO_BREAK_MINS: int = 5
    
    # CORS Approved Origins
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "")

settings = Settings()

try:
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    pass

try:
    settings.BACKUP_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    pass
