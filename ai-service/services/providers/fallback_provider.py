import re
from typing import List, Optional
from models.request_models import ExplanationData
from services.providers.base_provider import BaseExplanationProvider


class FallbackEducationalProvider(BaseExplanationProvider):
    """
    Built-in educational analysis provider that generates high-quality,
    pedagogically sound explanations without requiring external API keys.
    Also serves as an instant fallback if external LLM providers time out or fail.
    """

    def is_available(self) -> bool:
        return True

    async def generate_explanation(
        self,
        question: str,
        options: List[str],
        student_answer: Optional[str],
        correct_answer: str,
        is_correct: bool,
    ) -> ExplanationData:
        clean_q = question.strip()
        clean_correct = (correct_answer or "").strip()
        clean_student = (student_answer or "").strip()

        # Extract option letters/labels if present
        options_text = ", ".join([f"'{opt}'" for opt in options]) if options else ""

        # 1. Question Explanation
        if "?" in clean_q:
            core_query = clean_q
        else:
            core_query = f"{clean_q}?"

        question_explanation = (
            f"This question tests your understanding of the concept addressed in: \"{clean_q}\". "
            f"It evaluates whether you can identify the correct principle among the available options."
        )

        # 2. Correct Answer Explanation
        correct_answer_explanation = (
            f"The correct answer is \"{clean_correct}\". In this context, \"{clean_correct}\" "
            f"accurately satisfies the requirements specified in the question, following established definitions and best practices."
        )

        # 3. Student Answer Explanation
        if is_correct:
            student_answer_explanation = ""
        elif not clean_student or clean_student.lower() in ["not answered", "null", "none"]:
            student_answer_explanation = (
                "You did not attempt or select an answer for this question. "
                f"Reviewing the concept around \"{clean_correct}\" will help you answer similar questions in future tests."
            )
        else:
            student_answer_explanation = (
                f"You selected \"{clean_student}\". While this option might appear plausible, "
                f"it is not the correct choice for this specific question because it does not satisfy the exact condition "
                f"or definition required. In contrast, \"{clean_correct}\" is the precise correct answer."
            )

        # 4. Concept Explanation
        # Infer concept keywords from question
        keywords = [w for w in re.findall(r'\b[A-Za-z0-9_+#.-]+\b', clean_q) if len(w) > 3 and w.lower() not in ["what", "which", "where", "when", "how", "does", "that", "this", "from", "with", "used", "into"]]
        concept_term = " / ".join(keywords[:3]) if keywords else "the targeted subject"

        concept_explanation = (
            f"Understanding {concept_term} is a foundational building block in this topic. "
            f"Mastering how \"{clean_correct}\" interacts with the underlying rules helps solidify your problem-solving and conceptual clarity."
        )

        # 5. Example
        example = (
            f"Example Scenario: When encountering questions related to {concept_term}, "
            f"verify each option against the core definition. Here, selecting \"{clean_correct}\" correctly aligns with the standard specification."
        )

        # 6. Learning Tip
        learning_tip = (
            f"💡 Tip: Carefully review each distractor option. Pay close attention to key terms in the question stem "
            f"and remember that \"{clean_correct}\" directly addresses the core objective."
        )

        return ExplanationData(
            questionExplanation=question_explanation,
            correctAnswerExplanation=correct_answer_explanation,
            studentAnswerExplanation=student_answer_explanation,
            conceptExplanation=concept_explanation,
            example=example,
            learningTip=learning_tip
        )
