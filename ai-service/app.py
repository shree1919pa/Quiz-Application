import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Ensure environment variables are loaded from the ai-service directory
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)
load_dotenv(override=True)  # Fallback to CWD

from models.request_models import (
    ExplainQuestionRequest,
    ExplainQuestionResponse,
    ExplanationData,
)
from services.explanation_service import explanation_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_service")

# Safe startup diagnostics (NEVER log secret values)
_gemini_key_present = bool((os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY") or "").strip())
_gemini_model = os.getenv("GEMINI_MODEL") or os.getenv("AI_MODEL") or "gemini-3.5-flash-lite"
_ai_provider = os.getenv("AI_PROVIDER", "gemini")
logger.info(
    f"AI Service Initialized | Provider: {_ai_provider} | Gemini Key Configured: {_gemini_key_present} | Model: {_gemini_model}"
)

# Initialize FastAPI app
app = FastAPI(
    title="Online Quiz AI Explanation Service",
    version="1.0.0",
    description="Microservice providing AI-powered question and answer educational explanations via Google Gemini."
)

# CORS middleware
origins = [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Health check endpoint providing non-sensitive service status."""
    key_configured = bool((os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY") or "").strip())
    return {
        "status": "healthy",
        "service": "Online Quiz AI Explanation Service",
        "version": "1.0.0",
        "provider": os.getenv("AI_PROVIDER", "gemini"),
        "gemini_model": os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
        "gemini_key_configured": key_configured
    }


@app.post("/explain-question", response_model=ExplainQuestionResponse, status_code=status.HTTP_200_OK)
async def explain_question(req: ExplainQuestionRequest):
    """
    Generate an educational explanation for a quiz question using Gemini AI.
    """
    logger.info(f"Received explanation request for question: '{req.question[:60]}...'")
    try:
        explanation, provider = await explanation_service.explain_question(req)
        return ExplainQuestionResponse(
            success=True,
            explanation=explanation,
            provider=provider
        )
    except ValueError as ve:
        err_msg = str(ve)
        logger.warning(f"Validation or configuration error: {err_msg}")
        status_code = status.HTTP_400_BAD_REQUEST
        if "invalid" in err_msg.lower() and "key" in err_msg.lower():
            status_code = status.HTTP_401_UNAUTHORIZED
        elif "rate limit" in err_msg.lower() or "quota" in err_msg.lower():
            status_code = status.HTTP_429_TOO_MANY_REQUESTS
        raise HTTPException(status_code=status_code, detail=err_msg)
    except Exception as e:
        err_msg = str(e)
        logger.error(f"Failed to generate explanation: {err_msg}", exc_info=True)
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        if "rate limit" in err_msg.lower() or "quota" in err_msg.lower():
            status_code = status.HTTP_429_TOO_MANY_REQUESTS
        elif "network" in err_msg.lower() or "connect" in err_msg.lower():
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        raise HTTPException(
            status_code=status_code,
            detail=err_msg
        )


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"Starting AI service on http://{host}:{port}")
    uvicorn.run("app:app", host=host, port=port, reload=True)
