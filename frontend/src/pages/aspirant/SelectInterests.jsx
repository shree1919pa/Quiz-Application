import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api.js";
import { CATEGORIES } from "../../utils/categories.js";

const SelectInterests = () => {
    const navigate = useNavigate();

    const [selectedInterests, setSelectedInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isUpdateMode, setIsUpdateMode] = useState(false);

    useEffect(() => {
        loadUserInterests();
    }, []);

    const loadUserInterests = async () => {
        try {
            const data = await apiFetch("/profile");
            const existingInterests = data.user?.interests || [];
            setSelectedInterests(existingInterests);
            if (existingInterests.length > 0) {
                setIsUpdateMode(true);
            }
        } catch (err) {
            console.error("Error loading profile:", err);
            // Fallback to local storage if profile fetch fails
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    if (parsed.interests && parsed.interests.length > 0) {
                        setSelectedInterests(parsed.interests);
                        setIsUpdateMode(true);
                    }
                } catch {
                    // Ignore parse error
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleInterest = (categoryName) => {
        setError("");
        setSelectedInterests(prev => {
            if (prev.includes(categoryName)) {
                return prev.filter(item => item !== categoryName);
            } else {
                return [...prev, categoryName];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedInterests.length === CATEGORIES.length) {
            setSelectedInterests([]);
        } else {
            setSelectedInterests(CATEGORIES.map(c => c.name));
        }
    };

    const handleSave = async () => {
        setError("");
        setSuccess("");

        if (selectedInterests.length === 0) {
            setError("Please select at least one field of interest to continue.");
            return;
        }

        try {
            setSaving(true);
            const response = await apiFetch("/profile/interests", {
                method: "PUT",
                body: JSON.stringify({ interests: selectedInterests })
            });

            // Update user in localStorage
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    parsed.interests = selectedInterests;
                    localStorage.setItem("user", JSON.stringify(parsed));
                } catch {
                    // Ignore parse error
                }
            }

            setSuccess("Your interests have been saved successfully!");

            setTimeout(() => {
                navigate("/aspirant");
            }, 800);

        } catch (err) {
            console.error("Failed to save interests:", err);
            setError(err.message || "Unable to save your interests. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="page-shell">
                <section className="card-panel" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <h2>Loading interests...</h2>
                </section>
            </main>
        );
    }

    return (
        <main className="page-shell" style={{ padding: "30px 0 60px" }}>
            <section className="card-panel" style={{ maxWidth: "1000px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px", marginBottom: "20px" }}>
                    <div>
                        <span className="eyebrow">
                            🎯 Personalized Exam Recommendations
                        </span>
                        <h1 style={{ marginTop: "10px", fontSize: "2rem" }}>
                            {isUpdateMode ? "⚙️ Manage Your Interests" : "Select Your Interests"}
                        </h1>
                        <p style={{ color: "var(--muted)", marginTop: "6px" }}>
                            Choose the fields and categories you want to take quizzes in. We will recommend relevant exams based on your preferences.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        {isUpdateMode && (
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => navigate("/aspirant")}
                            >
                                ← Back to Dashboard
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={handleSelectAll}
                        >
                            {selectedInterests.length === CATEGORIES.length ? "Deselect All" : "Select All"}
                        </button>
                    </div>
                </div>

                {/* Selection status badge bar */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--surface-soft)",
                    padding: "14px 20px",
                    borderRadius: "16px",
                    marginBottom: "25px",
                    border: "1px solid var(--border)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontWeight: "700", color: "var(--text)" }}>Selected Categories:</span>
                        <span style={{
                            background: selectedInterests.length > 0 ? "var(--primary)" : "var(--muted)",
                            color: "#fff",
                            padding: "4px 12px",
                            borderRadius: "999px",
                            fontWeight: "700",
                            fontSize: "0.85rem"
                        }}>
                            {selectedInterests.length} of {CATEGORIES.length}
                        </span>
                    </div>

                    <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                        {selectedInterests.length === 0 ? "No category selected yet" : `${selectedInterests.length} active recommendation filter(s)`}
                    </div>
                </div>

                {error && <div className="error-message" style={{ marginBottom: "20px" }}>{error}</div>}
                {success && <div className="success-message" style={{ marginBottom: "20px" }}>{success}</div>}

                {/* Category Selection Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "18px",
                    marginBottom: "35px"
                }}>
                    {CATEGORIES.map(category => {
                        const isSelected = selectedInterests.includes(category.name);

                        return (
                            <div
                                key={category.id}
                                onClick={() => toggleInterest(category.name)}
                                style={{
                                    border: isSelected ? `2.5px solid ${category.color || "var(--primary)"}` : "1.5px solid var(--border)",
                                    background: isSelected ? "rgba(40, 88, 221, 0.05)" : "var(--surface)",
                                    borderRadius: "18px",
                                    padding: "20px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    boxShadow: isSelected ? "0 8px 24px rgba(40, 88, 221, 0.15)" : "none",
                                    transform: isSelected ? "translateY(-3px)" : "none",
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                        <span style={{ fontSize: "2rem" }}>{category.icon}</span>
                                        <div style={{
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "50%",
                                            border: isSelected ? `2px solid ${category.color || "var(--primary)"}` : "2px solid var(--muted)",
                                            background: isSelected ? (category.color || "var(--primary)") : "transparent",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "0.8rem",
                                            fontWeight: "bold"
                                        }}>
                                            {isSelected ? "✓" : ""}
                                        </div>
                                    </div>

                                    <h3 style={{
                                        margin: "0 0 6px",
                                        fontSize: "1.15rem",
                                        color: isSelected ? (category.color || "var(--primary)") : "var(--text)"
                                    }}>
                                        {category.name}
                                    </h3>

                                    <p style={{
                                        fontSize: "0.85rem",
                                        color: "var(--muted)",
                                        lineHeight: "1.4",
                                        margin: 0
                                    }}>
                                        {category.description}
                                    </p>
                                </div>

                                <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px dashed var(--border)" }}>
                                    <span style={{
                                        fontSize: "0.8rem",
                                        fontWeight: "600",
                                        color: isSelected ? (category.color || "var(--primary)") : "var(--muted)"
                                    }}>
                                        {isSelected ? "● Selected" : "+ Click to Select"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Continue / Save Action */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "14px" }}>
                    {isUpdateMode && (
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => navigate("/aspirant")}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                        style={{ minWidth: "200px", fontSize: "1rem" }}
                    >
                        {saving ? "Saving Preferences..." : (isUpdateMode ? "Save Changes & Update Exams" : "Continue to Dashboard →")}
                    </button>
                </div>
            </section>
        </main>
    );
};

export default SelectInterests;
