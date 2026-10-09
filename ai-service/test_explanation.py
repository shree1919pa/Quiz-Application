import asyncio
import sys
import os

# Add ai-service to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ai-service"))

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from models.request_models import ExplainQuestionRequest
from services.explanation_service import explanation_service


async def test_explanation_service():
    print("========== TEST 1: Correct Answer Explanation ==========")
    req1 = ExplainQuestionRequest(
        question="Which keyword is used to inherit a class in Java?",
        options=["A. implements", "B. extends", "C. inherits", "D. using"],
        studentAnswer="B. extends",
        correctAnswer="B. extends",
        isCorrect=True
    )
    exp1, provider1 = await explanation_service.explain_question(req1)
    print(f"Provider: {provider1}")
    print(f"Question Explanation: {exp1.questionExplanation}")
    print(f"Correct Answer Explanation: {exp1.correctAnswerExplanation}")
    print(f"Student Answer Explanation: '{exp1.studentAnswerExplanation}' (Expected empty or supportive)")
    print(f"Concept: {exp1.conceptExplanation}")
    print(f"Example: {exp1.example}")
    print(f"Learning Tip: {exp1.learningTip}")
    assert exp1.correctAnswerExplanation, "Correct answer explanation should not be empty"
    assert exp1.studentAnswerExplanation == "", "Student answer explanation should be empty for correct answer"

    print("\n========== TEST 2: Incorrect Answer Explanation ==========")
    req2 = ExplainQuestionRequest(
        question="Which keyword is used to inherit a class in Java?",
        options=["A. implements", "B. extends", "C. inherits", "D. using"],
        studentAnswer="A. implements",
        correctAnswer="B. extends",
        isCorrect=False
    )
    exp2, provider2 = await explanation_service.explain_question(req2)
    print(f"Provider: {provider2}")
    print(f"Student Answer Explanation: {exp2.studentAnswerExplanation}")
    print(f"Correct Answer Explanation: {exp2.correctAnswerExplanation}")
    assert exp2.studentAnswerExplanation, "Student answer explanation should explain why 'implements' was wrong"

    print("\n========== TEST 3: Unanswered Question Explanation ==========")
    req3 = ExplainQuestionRequest(
        question="What is the time complexity of binary search?",
        options=["A. O(n)", "B. O(log n)", "C. O(n^2)", "D. O(1)"],
        studentAnswer="",
        correctAnswer="B. O(log n)",
        isCorrect=False
    )
    exp3, provider3 = await explanation_service.explain_question(req3)
    print(f"Provider: {provider3}")
    print(f"Correct Answer Explanation: {exp3.correctAnswerExplanation}")
    print(f"Concept: {exp3.conceptExplanation}")

    print("\n>>> ALL PYTHON EXPLANATION SERVICE TESTS PASSED! <<<")


if __name__ == "__main__":
    asyncio.run(test_explanation_service())
