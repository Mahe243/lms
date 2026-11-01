from fastapi import Header, HTTPException, status
from typing import Optional
from backend.config import settings

def verify_access_token(
    x_learnova_token: Optional[str] = Header(None, alias="X-Learnova-Token"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> bool:
    """
    Validates that incoming requests originate from the authenticated personal learner.
    Accepts token via 'X-Learnova-Token' header or 'Authorization: Bearer <token>'.
    """
    if not settings.REQUIRE_AUTH:
        return True

    provided_token = x_learnova_token
    if not provided_token and authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            provided_token = parts[1]

    if not provided_token or provided_token != settings.LEARNOVA_ACCESS_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid or missing Learnova access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return True
