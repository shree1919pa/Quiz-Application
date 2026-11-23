import os
import logging
from typing import Tuple
from pathlib import Path
from dotenv import load_dotenv

from models.request_models import ExplainQuestionRequest, ExplanationData
from services.providers.base_provider import BaseExplanationProvider
from services.providers.gemini_provider import GeminiProvider
from services.providers.openai_provider import OpenAIProvider
from services.providers.fallback_provider import FallbackEducationalProvider

logger = logging.getLogger(__name__)

# Ensure .env is loaded
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)


class ExplanationService:
    """
    Core AI service orchestrator for question explanations.
    Prioritizes Google Gemini as requested, with strict error reporting.
    """

    def __init__(self):
        self.gemini_provider = GeminiProvider()
        self.openai_provider = OpenAIProvider()
        self.fallback_provider = FallbackEducationalProvider()

    def _get_active_provider(self) -> Tuple[BaseExplanationProvider, str]:
        if _env_path.exists():
            load_dotenv(dotenv_path=_env_path, override=False)

        configured = os.getenv("AI_PROVIDER", "gemini").lower().strip()

        if configured == "gemini":
            if not self.gemini_provider.is_available():
                raise ValueError("Gemini API key is not configured. Please add your GEMINI_API_KEY in ai-service/.env")
            return self.gemini_provider, "gemini"

        if configured == "openai":
            if not self.openai_provider.is_available():
                raise ValueError("OpenAI API key is not configured. Please add OPENAI_API_KEY in ai-service/.env")
            return self.openai_provider, "openai"

        if configured == "fallback":
            return self.fallback_provider, "fallback"

        # Auto detection: prefer Gemini
        if self.gemini_provider.is_available():
            return self.gemini_provider, "gemini"
        if self.openai_provider.is_available():
            return self.openai_provider, "openai"

        raise ValueError("Gemini API key is not configured. Please set GEMINI_API_KEY in ai-service/.env")

    async def explain_question(self, req: ExplainQuestionRequest) -> Tuple[ExplanationData, str]:
        """
        Explain a single quiz question for a student using the active LLM provider.
        """
        provider, provider_name = self._get_active_provider()
        logger.info(f"Generating explanation using provider: {provider_name}")

        try:
            explanation = await provider.generate_explanation(
                question=req.question,
                options=req.options,
                student_answer=req.studentAnswer,
                correct_answer=req.correctAnswer,
                is_correct=req.isCorrect,
            )
            return explanation, provider_name
        except Exception as e:
            # If provider was specifically gemini or openai, bubble up the real error
            logger.error(f"Provider '{provider_name}' failed to generate explanation: {e}")
            raise


# Singleton instance
explanation_service = ExplanationService()
