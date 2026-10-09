import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Load environment variables
load_dotenv()

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

# Initialize FastAPI app
app = FastAPI(
    title="Online Quiz AI Explanation Service",
    version="1.0.0",
    description="Microservice providing AI-powered question and answer educational explanations."
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
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Online Quiz AI Explanation Service",
        "version": "1.0.0"
    }


@app.post("/explain-question", response_model=ExplainQuestionResponse, status_code=status.HTTP_200_OK)
async def explain_question(req: ExplainQuestionRequest):
    """
    Generate an educational explanation for a quiz question.
    """
    logger.info(f"Received explanation request for question: '{req.question[:60]}...'")
    try:
        explanation, provider = await explanation_service.explain_question(req)
        return ExplainQuestionResponse(
            success=True,
            explanation=explanation,
            provider=provider
        )
    except Exception as e:
        logger.error(f"Failed to generate explanation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI explanation: {str(e)}"
        )


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"Starting AI service on {host}:{port}")
    uvicorn.run("app:app", host=host, port=port, reload=True)
