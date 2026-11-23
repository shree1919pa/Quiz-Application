import asyncio
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Ensure ai-service directory is in sys.path
ai_service_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(ai_service_dir))

# Explicitly load .env from ai-service
load_dotenv(dotenv_path=ai_service_dir / ".env")

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from models.request_models import ExplainQuestionRequest
from services.explanation_service import explanation_service


async def run_tests():
    api_key = (os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY") or "").strip()
    key_configured = bool(api_key)

    print("==================================================")
    print("AI Explanation Service Test Suite")
    print(f"Provider: {os.getenv('AI_PROVIDER', 'gemini')}")
    print(f"Model: {os.getenv('GEMINI_MODEL', 'gemini-3.5-flash-lite')}")
    print(f"Gemini API Key Configured: {key_configured}")
    print("==================================================")

    if not key_configured:
        print("\n>>> Testing Missing API Key Validation Handling...")
        req = ExplainQuestionRequest(
            question="What is recursion in computer science?",
            options=["A. A loop construct", "B. A function calling itself", "C. A data structure", "D. An operating system"],
            studentAnswer="B. A function calling itself",
            correctAnswer="B. A function calling itself",
            isCorrect=True
        )
        try:
            await explanation_service.explain_question(req)
            print("ERROR: Expected ValueError for missing API key, but succeeded!")
            sys.exit(1)
        except ValueError as e:
            print(f"SUCCESS: Caught expected missing key error:\n  -> {e}")
            print("\nTo test with real Gemini generation, add your GEMINI_API_KEY to ai-service/.env and rerun this script.")
            return

    # If key is configured, run live tests
    print("\n========== TEST 1: Correct Answer Explanation ==========")
    req1 = ExplainQuestionRequest(
        question="Which keyword is used to inherit a class in Java?",
        options=["A. implements", "B. extends", "C. inherits", "D. using"],
        studentAnswer="B. extends",
        correctAnswer="B. extends",
        isCorrect=True
    )
    exp1, provider1 = await explanation_service.explain_question(req1)
    print(f"Provider Used: {provider1}")
    print(f"Question Explanation: {exp1.questionExplanation[:120]}...")
    print(f"Correct Answer Explanation: {exp1.correctAnswerExplanation[:120]}...")
    print(f"Student Answer Explanation: '{exp1.studentAnswerExplanation}' (Expected empty)")
    print(f"Concept: {exp1.conceptExplanation[:100]}...")
    print(f"Example: {exp1.example[:100]}...")
    print(f"Learning Tip: {exp1.learningTip[:100]}...")
    assert exp1.correctAnswerExplanation, "Correct answer explanation should not be empty"
    assert exp1.studentAnswerExplanation == "", "Student answer explanation must be empty for correct answers"

    print("\n========== TEST 2: Incorrect Answer Explanation ==========")
    req2 = ExplainQuestionRequest(
        question="Which keyword is used to inherit a class in Java?",
        options=["A. implements", "B. extends", "C. inherits", "D. using"],
        studentAnswer="A. implements",
        correctAnswer="B. extends",
        isCorrect=False
    )
    exp2, provider2 = await explanation_service.explain_question(req2)
    print(f"Provider Used: {provider2}")
    print(f"Student Answer Explanation: {exp2.studentAnswerExplanation[:120]}...")
    print(f"Correct Answer Explanation: {exp2.correctAnswerExplanation[:120]}...")
    assert exp2.studentAnswerExplanation, "Student answer explanation should explain why 'implements' was wrong"

    print("\n========== TEST 3: Unanswered Question Explanation ==========")
    req3 = ExplainQuestionRequest(
        question="What is the time complexity of binary search on a sorted array?",
        options=["A. O(n)", "B. O(log n)", "C. O(n^2)", "D. O(1)"],
        studentAnswer="",
        correctAnswer="B. O(log n)",
        isCorrect=False
    )
    exp3, provider3 = await explanation_service.explain_question(req3)
    print(f"Provider Used: {provider3}")
    print(f"Correct Answer Explanation: {exp3.correctAnswerExplanation[:120]}...")
    print(f"Concept: {exp3.conceptExplanation[:100]}...")
    assert exp3.studentAnswerExplanation == "", "Student answer explanation must be empty for unattempted questions"

    print("\n>>> ALL GEMINI EXPLANATION SERVICE TESTS PASSED! <<<")


if __name__ == "__main__":
    asyncio.run(run_tests())
