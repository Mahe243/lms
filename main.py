import os
import uvicorn
from backend.main import app

# Export ASGI application for uvicorn, gunicorn, and cloud runners
# e.g., `uvicorn main:app --host 0.0.0.0 --port $PORT`

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
