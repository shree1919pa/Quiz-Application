import os
import logging
from typing import Tuple

from models.request_models import ExplainQuestionRequest, ExplanationData
from services.providers.base_provider import BaseExplanationProvider
from services.providers.gemini_provider import GeminiProvider
from services.providers.openai_provider import OpenAIProvider
from services.providers.fallback_provider import FallbackEducationalProvider

logger = logging.getLogger(__name__)


class ExplanationService:
    """
    Core AI service abstraction that decouples the rest of the application
    from specific LLM providers (Gemini, OpenAI, Fallback).
    """

    def __init__(self):
        self.gemini_provider = GeminiProvider()
        self.openai_provider = OpenAIProvider()
        self.fallback_provider = FallbackEducationalProvider()

    def _get_active_provider(self) -> Tuple[BaseExplanationProvider, str]:
        configured = os.getenv("AI_PROVIDER", "auto").lower()

        if configured == "gemini":
            if self.gemini_provider.is_available():
                return self.gemini_provider, "gemini"
            logger.warning("Gemini requested but no API key set; falling back to educational fallback provider.")
            return self.fallback_provider, "fallback"

        if configured == "openai":
            if self.openai_provider.is_available():
                return self.openai_provider, "openai"
            logger.warning("OpenAI requested but no API key set; falling back to educational fallback provider.")
            return self.fallback_provider, "fallback"

        if configured == "fallback":
            return self.fallback_provider, "fallback"

        # Auto detection: prefer Gemini if configured, then OpenAI, then Fallback
        if self.gemini_provider.is_available():
            return self.gemini_provider, "gemini"
        if self.openai_provider.is_available():
            return self.openai_provider, "openai"

        return self.fallback_provider, "fallback"

    async def explain_question(self, req: ExplainQuestionRequest) -> Tuple[ExplanationData, str]:
        """
        Explain a single quiz question for a student.
        Returns the explanation data and the name of the provider that generated it.
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
            logger.error(f"Provider {provider_name} failed: {e}. Utilizing educational fallback.")
            explanation = await self.fallback_provider.generate_explanation(
                question=req.question,
                options=req.options,
                student_answer=req.studentAnswer,
                correct_answer=req.correctAnswer,
                is_correct=req.isCorrect,
            )
            return explanation, "fallback"


# Singleton instance
explanation_service = ExplanationService()
