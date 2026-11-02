import sys
from pathlib import Path

# Add project root to sys.path so backend modules import properly on Vercel
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.main import app as fastapi_app

class VercelPathNormalizer:
    """Normalizes ASGI scope path when Vercel rewrites to /api/index.py or /api/index"""
    def __init__(self, asgi_app):
        self.asgi_app = asgi_app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            path = scope.get("path", "")
            if path in ["/api/index.py", "/api/index", "/api/index.py/"]:
                scope["path"] = "/"
            elif path.startswith("/api/index.py/"):
                scope["path"] = path.replace("/api/index.py", "", 1)
        await self.asgi_app(scope, receive, send)

handler = VercelPathNormalizer(fastapi_app)
app = handler
