import React, { useState } from "react";

const AIExplanationCard = ({ explanation, onRefresh, isRefreshing }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!explanation) return null;

  const {
    questionExplanation,
    correctAnswerExplanation,
    studentAnswerExplanation,
    conceptExplanation,
    example,
    learningTip,
    provider
  } = explanation;

  return (
    <div
      style={{
        marginTop: "18px",
        background: "linear-gradient(135deg, rgba(240, 244, 255, 0.95) 0%, rgba(248, 250, 255, 0.95) 100%)",
        border: "1px solid rgba(40, 88, 221, 0.22)",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 8px 24px rgba(40, 88, 221, 0.08)",
        transition: "all 0.3s ease"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: collapsed ? "0" : "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "1.35rem",
              background: "linear-gradient(135deg, #2858dd, #7b2cbf)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            🤖 AI Question Explanation
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: "700",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(40, 88, 221, 0.15), rgba(123, 44, 191, 0.15))",
              color: "#2858dd",
              border: "1px solid rgba(40, 88, 221, 0.2)"
            }}
          >
            AI-Powered
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{
                background: "transparent",
                border: "1px solid rgba(40, 88, 221, 0.25)",
                color: "#2858dd",
                borderRadius: "8px",
                padding: "5px 12px",
                fontSize: "0.82rem",
                cursor: isRefreshing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
              title="Regenerate explanation"
            >
              🔄 {isRefreshing ? "Regenerating..." : "Refresh"}
            </button>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "white",
              border: "1px solid rgba(20, 38, 81, 0.15)",
              color: "#5f6d8a",
              borderRadius: "8px",
              padding: "5px 12px",
              fontSize: "0.82rem",
              cursor: "pointer"
            }}
          >
            {collapsed ? "Expand Details ▼" : "Collapse ▲"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* 1. What the Question Asks */}
          {questionExplanation && (
            <div
              style={{
                background: "white",
                padding: "14px 16px",
                borderRadius: "12px",
                borderLeft: "4px solid #2858dd",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
              }}
            >
              <h4
                style={{
                  margin: "0 0 6px 0",
                  color: "#13214a",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.95rem"
                }}
              >
                🎯 <span>What the Question Asks</span>
              </h4>
              <p style={{ margin: 0, color: "#334155", lineHeight: "1.55", fontSize: "0.92rem" }}>
                {questionExplanation}
              </p>
            </div>
          )}

          {/* 2. Why Correct Answer is Correct */}
          {correctAnswerExplanation && (
            <div
              style={{
                background: "white",
                padding: "14px 16px",
                borderRadius: "12px",
                borderLeft: "4px solid #16a34a",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
              }}
            >
              <h4
                style={{
                  margin: "0 0 6px 0",
                  color: "#166534",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.95rem"
                }}
              >
                ✅ <span>Why the Correct Answer is Right</span>
              </h4>
              <p style={{ margin: 0, color: "#334155", lineHeight: "1.55", fontSize: "0.92rem" }}>
                {correctAnswerExplanation}
              </p>
            </div>
          )}

          {/* 3. Why Your Answer Was Incorrect (if applicable) */}
          {studentAnswerExplanation && studentAnswerExplanation.trim() !== "" && (
            <div
              style={{
                background: "white",
                padding: "14px 16px",
                borderRadius: "12px",
                borderLeft: "4px solid #dc2626",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
              }}
            >
              <h4
                style={{
                  margin: "0 0 6px 0",
                  color: "#991b1b",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.95rem"
                }}
              >
                ❌ <span>Why Your Answer Was Incorrect</span>
              </h4>
              <p style={{ margin: 0, color: "#334155", lineHeight: "1.55", fontSize: "0.92rem" }}>
                {studentAnswerExplanation}
              </p>
            </div>
          )}

          {/* 4. Core Concept */}
          {conceptExplanation && (
            <div
              style={{
                background: "white",
                padding: "14px 16px",
                borderRadius: "12px",
                borderLeft: "4px solid #8b5cf6",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
              }}
            >
              <h4
                style={{
                  margin: "0 0 6px 0",
                  color: "#5b21b6",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.95rem"
                }}
              >
                💡 <span>Underlying Concept</span>
              </h4>
              <p style={{ margin: 0, color: "#334155", lineHeight: "1.55", fontSize: "0.92rem" }}>
                {conceptExplanation}
              </p>
            </div>
          )}

          {/* 5. Example */}
          {example && (
            <div
              style={{
                background: "#f8fafc",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
              }}
            >
              <h4
                style={{
                  margin: "0 0 6px 0",
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.95rem"
                }}
              >
                📝 <span>Example / Code Illustration</span>
              </h4>
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: "0.88rem",
                  color: "#0f172a",
                  background: "#e2e8f0",
                  padding: "10px 12px",
                  borderRadius: "8px"
                }}
              >
                {example}
              </pre>
            </div>
          )}

          {/* 6. Learning Tip */}
          {learningTip && (
            <div
              style={{
                background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid #fde68a"
              }}
            >
              <h4
                style={{
                  margin: "0 0 4px 0",
                  color: "#92400e",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.92rem"
                }}
              >
                🚀 <span>Quick Learning Tip</span>
              </h4>
              <p style={{ margin: 0, color: "#78350f", fontSize: "0.88rem", lineHeight: "1.5" }}>
                {learningTip}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIExplanationCard;
