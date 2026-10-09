import os
import json
import logging
from typing import List, Optional
import httpx

from models.request_models import ExplanationData
from services.providers.base_provider import BaseExplanationProvider

logger = logging.getLogger(__name__)


class GeminiProvider(BaseExplanationProvider):
    """Google Gemini AI Provider for generating structured educational explanations."""

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY")
        self.model_name = model_name or os.getenv("GEMINI_MODEL") or os.getenv("AI_MODEL") or "gemini-1.5-flash"

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
            raise ValueError("Gemini API key is not configured.")

        # Try Google Generative AI SDK first, fallback to REST API
        prompt = self._build_prompt(question, options, student_answer, correct_answer, is_correct)
        system_instruction = (
            "You are an educational AI assistant for an online quiz learning platform. "
            "Your role is to explain questions and answers in an engaging, concise, and pedagogical manner. "
            "You MUST output valid JSON conforming exactly to the requested schema. "
            "Do NOT include markdown backticks around JSON if possible, or provide raw JSON."
        )

        try:
            raw_text = await self._call_gemini_api(prompt, system_instruction)
            parsed_data = self._parse_json_response(raw_text)
            return ExplanationData(**parsed_data)
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
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
Explain the following quiz question to a student.

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

Instructions:
1. Explain what the question is asking clearly.
2. Explain why the correct answer is correct.
3. If the student's answer was incorrect, explain why the selected answer is incorrect. If the answer was correct or unanswered, leave "studentAnswerExplanation" as an empty string ("").
4. Explain the underlying educational/computational concept.
5. Provide a short, practical example or code snippet.
6. Provide a quick learning tip or mnemonic for remembering this.

Return ONLY a valid JSON object with EXACTLY these keys:
{{
  "questionExplanation": "...",
  "correctAnswerExplanation": "...",
  "studentAnswerExplanation": "...",
  "conceptExplanation": "...",
  "example": "...",
  "learningTip": "..."
}}
"""

    async def _call_gemini_api(self, prompt: str, system_instruction: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "responseMimeType": "application/json"
            },
            "systemInstruction": {
                "parts": [
                    {"text": system_instruction}
                ]
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            
            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("No candidates returned from Gemini API")
            
            content_parts = candidates[0].get("content", {}).get("parts", [])
            if not content_parts:
                raise ValueError("Empty content returned from Gemini API")
                
            return content_parts[0].get("text", "{}")

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
