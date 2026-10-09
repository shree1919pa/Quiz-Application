import os
import json
import logging
from typing import List, Optional
import httpx

from models.request_models import ExplanationData
from services.providers.base_provider import BaseExplanationProvider

logger = logging.getLogger(__name__)


class OpenAIProvider(BaseExplanationProvider):
    """OpenAI API Provider (GPT-4o, GPT-4o-mini, GPT-3.5-turbo, etc.)."""

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY") or os.getenv("AI_API_KEY")
        self.model_name = model_name or os.getenv("OPENAI_MODEL") or os.getenv("AI_MODEL") or "gpt-4o-mini"

    def is_available(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def generate_explanation(
        self,
        question: str,
        options: List[str],
        student_answer: Optional[str],
        correct_answer: str,
        is_correct: bool,
    ) -> ExplanationData:
        if not self.is_available():
            raise ValueError("OpenAI API key is not configured.")

        prompt = self._build_prompt(question, options, student_answer, correct_answer, is_correct)
        system_instruction = (
            "You are an educational AI tutor for an online quiz platform. "
            "Explain questions, correct answers, and misconceptions accurately and concisely. "
            "Always respond with a valid JSON object."
        )

        try:
            raw_text = await self._call_openai_api(prompt, system_instruction)
            parsed_data = self._parse_json_response(raw_text)
            return ExplanationData(**parsed_data)
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise

    def _build_prompt(
        self,
        question: str,
        options: List[str],
        student_answer: Optional[str],
        correct_answer: str,
        is_correct: bool,
    ) -> str:
        options_formatted = "\n".join([f"- {opt}" for opt in options]) if options else "No multiple-choice options provided"
        student_str = student_answer.strip() if student_answer else "Not Attempted"

        return f"""
Explain the following quiz question to a student:

Question:
{question}

Options:
{options_formatted}

Student Answer:
{student_str}

Correct Answer:
{correct_answer}

Answer Status:
{"Correct" if is_correct else ("Unanswered" if not student_answer else "Incorrect")}

Provide valid JSON with exactly:
{{
  "questionExplanation": "...",
  "correctAnswerExplanation": "...",
  "studentAnswerExplanation": "...",
  "conceptExplanation": "...",
  "example": "...",
  "learningTip": "..."
}}
If the student answer was correct or unattempted, leave "studentAnswerExplanation" as empty string ("").
"""

    async def _call_openai_api(self, prompt: str, system_instruction: str) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.3
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            choices = data.get("choices", [])
            if not choices:
                raise ValueError("No choices returned from OpenAI")
            return choices[0].get("message", {}).get("content", "{}")

    def _parse_json_response(self, text: str) -> dict:
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        data = json.loads(text)
        return {
            "questionExplanation": data.get("questionExplanation", ""),
            "correctAnswerExplanation": data.get("correctAnswerExplanation", ""),
            "studentAnswerExplanation": data.get("studentAnswerExplanation", ""),
            "conceptExplanation": data.get("conceptExplanation", ""),
            "example": data.get("example", ""),
            "learningTip": data.get("learningTip", ""),
        }
