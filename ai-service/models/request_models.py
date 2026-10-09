from typing import List, Optional
from pydantic import BaseModel, Field


class ExplainQuestionRequest(BaseModel):
    question: str = Field(..., description="The question text to explain")
    options: List[str] = Field(default_factory=list, description="List of multiple-choice options")
    studentAnswer: Optional[str] = Field(default="", description="The answer selected by the student (empty if unattempted)")
    correctAnswer: str = Field(..., description="The authoritative correct answer")
    isCorrect: bool = Field(default=False, description="Whether the student's answer was correct")


class ExplanationData(BaseModel):
    questionExplanation: str = Field(default="", description="What the question is asking")
    correctAnswerExplanation: str = Field(default="", description="Why the correct answer is correct")
    studentAnswerExplanation: str = Field(default="", description="Why student answer is wrong (empty if correct or unattempted)")
    conceptExplanation: str = Field(default="", description="The underlying educational/technical concept")
    example: str = Field(default="", description="Concise example or code snippet illustrating the concept")
    learningTip: str = Field(default="", description="Helpful learning tip or mnemonic for remembering the concept")


class ExplainQuestionResponse(BaseModel):
    success: bool = True
    explanation: ExplanationData
    provider: Optional[str] = None
    error: Optional[str] = None
