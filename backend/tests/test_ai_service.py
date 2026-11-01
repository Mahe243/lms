import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from backend.config import settings
from backend.services.ai_service import call_gemini, map_ai_api_error, generate_tutor_response

def test_ai_model_default_and_config():
    """Verify that default model is not retired gemini-1.5-flash and is configurable."""
    assert "gemini-1.5" not in settings.AI_MODEL
    assert "flash" in settings.AI_MODEL.lower()

def test_map_ai_api_error_mappings():
    """Verify clean user-facing error message mappings."""
    # 404 retired / not found
    err_404 = map_ai_api_error("Gemini", 404, "models/gemini-1.5-flash is not found", "gemini-1.5-flash")
    assert "retired" in err_404 or "not found" in err_404
    assert "AI_MODEL" in err_404

    # 401/403 invalid key
    err_403 = map_ai_api_error("Gemini", 403, "API key not valid. Please pass a valid API key.", "gemini-2.5-flash")
    assert "Invalid or unauthorized" in err_403
    assert "GEMINI_API_KEY" in err_403

    # 429 quota exhausted
    err_429 = map_ai_api_error("Gemini", 429, "Resource has been exhausted (e.g. check quota).", "gemini-2.5-flash")
    assert "rate limit or quota exceeded" in err_429

@pytest.mark.anyio
async def test_call_gemini_mocked_success():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": "Hello Maheswar! Here is your derivation."}]
                }
            }
        ]
    }

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        result = await call_gemini(
            api_key="test_key",
            model="gemini-2.5-flash",
            system_prompt="system",
            user_message="hi",
            history=[]
        )
        assert result == "Hello Maheswar! Here is your derivation."

@pytest.mark.anyio
async def test_call_gemini_mocked_404_retired_error():
    mock_resp = MagicMock()
    mock_resp.status_code = 404
    mock_resp.text = '{"error": {"message": "models/gemini-1.5-flash is not found for API version v1beta"}}'
    mock_resp.json.return_value = {
        "error": {"message": "models/gemini-1.5-flash is not found for API version v1beta"}
    }

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        with pytest.raises(Exception) as exc_info:
            await call_gemini(
                api_key="test_key",
                model="gemini-1.5-flash",
                system_prompt="system",
                user_message="hi",
                history=[]
            )
        assert "retired" in str(exc_info.value) or "not found" in str(exc_info.value)
