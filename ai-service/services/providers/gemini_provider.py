import os
import json
import logging
from typing import List, Optional
from pathlib import Path
from dotenv import load_dotenv
import httpx

from models.request_models import ExplanationData
from services.providers.base_provider import BaseExplanationProvider

logger = logging.getLogger(__name__)

# Ensure .env is loaded from the ai-service directory
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)


class GeminiProvider(BaseExplanationProvider):
    """Google Gemini AI Provider for generating structured educational explanations using official SDK and REST fallback."""

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self._explicit_key = api_key
        self._explicit_model = model_name

    @property
    def api_key(self) -> str:
        if self._explicit_key:
            return self._explicit_key.strip()
        # Reload from env in case .env was edited
        if _env_path.exists():
            load_dotenv(dotenv_path=_env_path, override=True)
        return (os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY") or "").strip()

    @property
    def model_name(self) -> str:
        if self._explicit_model:
            model = self._explicit_model.strip()
        else:
            if _env_path.exists():
                load_dotenv(dotenv_path=_env_path, override=True)
            model = (os.getenv("GEMINI_MODEL") or os.getenv("AI_MODEL") or "gemini-3.5-flash-lite").strip()

        # Seamlessly map deprecated / retired Google Gemini model identifiers to active stable equivalent
        deprecated_models = {
            "gemini-1.5-flash": "gemini-3.5-flash-lite",
            "gemini-1.5-flash-latest": "gemini-3.5-flash-lite",
            "gemini-1.5-pro": "gemini-3.5-flash-lite",
            "gemini-2.5-flash": "gemini-3.5-flash-lite",
            "gemini-2.5-flash-lite": "gemini-3.5-flash-lite",
        }
        clean_model = model.replace("models/", "")
        return deprecated_models.get(clean_model, model)

    def is_available(self) -> bool:
        return bool(self.api_key)

    async def generate_explanation(
        self,
        question: str,
        options: List[str],
        student_answer: Optional[str],
        correct_answer: str,
        is_correct: bool,
    ) -> ExplanationData:
        if not self.is_available():
            raise ValueError(
                "Gemini API key is not configured. Please add your GEMINI_API_KEY to the ai-service/.env file."
            )

        prompt = self._build_prompt(question, options, student_answer, correct_answer, is_correct)
        system_instruction = (
            "You are an educational AI tutor for an online quiz learning platform. "
            "Your task is to explain quiz questions and answers in an encouraging, clear, and pedagogical manner. "
            "You MUST output valid, parseable JSON conforming exactly to the requested schema. "
            "Do NOT include markdown backticks around JSON."
        )

        logger.info(f"Generating Gemini explanation using model: '{self.model_name}'")

        # 1. Attempt official google-genai SDK
        try:
            raw_text = await self._call_with_genai_sdk(prompt, system_instruction)
            parsed_data = self._parse_json_response(raw_text)
            self._sanitize_explanations(parsed_data, is_correct, student_answer)
            return ExplanationData(**parsed_data)
        except Exception as sdk_err:
            safe_err = self._map_error(sdk_err)
            # If it's a permanent configuration/auth error or rate limit, raise immediately
            if any(term in safe_err.lower() for term in ["api key", "rate limit", "not found"]):
                logger.error(f"[Gemini SDK Auth/Config Error]: {safe_err}")
                raise ValueError(safe_err) from sdk_err

            logger.warning(f"Google Gen AI SDK call failed ({sdk_err}). Trying direct REST fallback...")

        # 2. Resilient fallback to direct HTTPX REST call
        try:
            raw_text = await self._call_with_httpx_rest(prompt, system_instruction)
            parsed_data = self._parse_json_response(raw_text)
            self._sanitize_explanations(parsed_data, is_correct, student_answer)
            return ExplanationData(**parsed_data)
        except Exception as rest_err:
            safe_err = self._map_error(rest_err)
            logger.error(f"[Gemini REST Fallback Error]: {safe_err}")
            raise ValueError(safe_err) from rest_err

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
1. Explain what the question is asking in clear, student-friendly terms.
2. Explain why the correct answer is correct with clear reasoning.
3. If the student's answer was incorrect, explain why their selected answer is incorrect or a common misconception. If the student's answer was correct or unanswered, leave "studentAnswerExplanation" as an empty string ("").
4. Explain the core educational, theoretical, or computational concept or rule being tested.
5. Provide a short, practical example or code illustration where useful.
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

    async def _call_with_genai_sdk(self, prompt: str, system_instruction: str) -> str:
        """Use the modern official Google Gen AI Python SDK (google-genai)."""
        from google import genai
        from google.genai import types

        # Normalize model name (handle 'gemini-1.5-flash' or 'models/gemini-1.5-flash')
        model = self.model_name
        if model.startswith("models/"):
            model = model.replace("models/", "")

        client = genai.Client(api_key=self.api_key)
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.3,
            response_mime_type="application/json"
        )

        response = await client.aio.models.generate_content(
            model=model,
            contents=prompt,
            config=config
        )

        if not response or not response.text:
            raise ValueError("Empty response returned from Gemini API")

        return response.text

    async def _call_with_httpx_rest(self, prompt: str, system_instruction: str) -> str:
        """Resilient fallback directly using Google Generative Language REST v1beta endpoint."""
        model = self.model_name
        if model.startswith("models/"):
            model = model.replace("models/", "")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
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
            if resp.status_code != 200:
                err_text = resp.text
                logger.error(f"[Gemini REST HTTP {resp.status_code}]")
                raise httpx.HTTPStatusError(
                    f"HTTP {resp.status_code}: {err_text}",
                    request=resp.request,
                    response=resp
                )

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
        # Clean markdown wrappers
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        # Find outer JSON bounds if model included prelude/postscript text
        start_idx = text.find("{")
        end_idx = text.rfind("}")
        if start_idx != -1 and end_idx != -1:
            text = text[start_idx : end_idx + 1]

        data = json.loads(text)
        return {
            "questionExplanation": str(data.get("questionExplanation", "")).strip(),
            "correctAnswerExplanation": str(data.get("correctAnswerExplanation", "")).strip(),
            "studentAnswerExplanation": str(data.get("studentAnswerExplanation", "")).strip(),
            "conceptExplanation": str(data.get("conceptExplanation", "")).strip(),
            "example": str(data.get("example", "")).strip(),
            "learningTip": str(data.get("learningTip", "")).strip(),
        }

    def _sanitize_explanations(self, data: dict, is_correct: bool, student_answer: Optional[str]):
        """Ensure studentAnswerExplanation is empty if answer was correct or unanswered."""
        if is_correct or not student_answer or not student_answer.strip():
            data["studentAnswerExplanation"] = ""

    def _map_error(self, err: Exception) -> str:
        """Map exception to a safe, diagnostic user-friendly error message without leaking secrets."""
        msg = str(err)
        code = getattr(err, "code", None)

        if "API_KEY_INVALID" in msg or "API key not valid" in msg or (code in (400, 401, 403) and "API key" in msg):
            return "Invalid Gemini API key. Please check your GEMINI_API_KEY in ai-service/.env."
        if code == 429 or "429" in msg or "RESOURCE_EXHAUSTED" in msg or "quota" in msg.lower():
            return "Gemini API rate limit or quota exceeded. Please wait a moment and try again."
        if code == 404 or "not found" in msg.lower():
            return f"Configured Gemini model '{self.model_name}' was not found. Please verify GEMINI_MODEL in ai-service/.env."
        if "connect" in msg.lower() or "timeout" in msg.lower() or "network" in msg.lower():
            return "Network failure communicating with Google Gemini API. Please check your internet connection."
        if "empty" in msg.lower():
            return "Gemini returned an empty response. Please try again."

        return f"Gemini API request failed: {msg[:100]}"
