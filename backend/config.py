import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "Personal LMS"
    PROJECT_VERSION: str = "1.0.0"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'lms.db'}")
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    BACKUP_DIR: Path = BASE_DIR / "backups"
    
    # AI settings
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini") # gemini, openai, local
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")
    
    # Study Settings
    STREAK_MIN_MINUTES: int = 15
    IDLE_TIMEOUT_MINUTES: int = 30
    DEFAULT_POMODORO_WORK_MINS: int = 25
    DEFAULT_POMODORO_BREAK_MINS: int = 5

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.BACKUP_DIR.mkdir(parents=True, exist_ok=True)
