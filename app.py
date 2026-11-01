import os
import uvicorn
from backend.main import app

# Export ASGI application for runners invoking `uvicorn app:app` or `app.py`

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
