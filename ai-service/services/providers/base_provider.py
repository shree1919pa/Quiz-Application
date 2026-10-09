from abc import ABC, abstractmethod
from typing import List, Optional
from models.request_models import ExplanationData


class BaseExplanationProvider(ABC):
    """Abstract base class for all AI explanation providers."""

    @abstractmethod
    def is_available(self) -> bool:
        """Check whether this provider is configured and available."""
        pass

    @abstractmethod
    async def generate_explanation(
        self,
        question: str,
        options: List[str],
        student_answer: Optional[str],
        correct_answer: str,
        is_correct: bool,
    ) -> ExplanationData:
        """Generate a structured explanation for the given question and answer state."""
        pass
