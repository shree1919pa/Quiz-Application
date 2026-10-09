import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {

        try {

            const data = await apiFetch("/profile");

            setUser(data.user);

        } catch (error) {

            console.error(error);
            alert(error.message);

        } finally {

            setLoading(false);

        }

    };


    const changePassword = async () => {

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            alert("Please fill all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            alert("Password must contain at least 8 characters.");
            return;
        }

        try {

            setSaving(true);

            const data = await apiFetch(
                "/profile/password",
                {
                    method: "PUT",
                    body: JSON.stringify({
                        currentPassword,
                        newPassword,
                        confirmPassword
                    })
                }
            );

            alert(data.message);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (error) {

            console.error(error);
            alert(error.message);

        } finally {

            setSaving(false);

        }

    };

    if (loading) {

        return (

            <main className="page-shell">

                <section className="card-panel">

                    <h2 style={{ textAlign: "center" }}>
                        Loading Profile...
                    </h2>

                </section>

            </main>

        );

    }

    return (

        <main className="page-shell">

            <section
                className="card-panel"
                style={{
                    maxWidth: "750px",
                    margin: "40px auto"
                }}
            >

                <h1
                    style={{
                        textAlign: "center",
                        marginBottom: "30px"
                    }}
                >
                    My Profile
                </h1>

                {/* Avatar */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "30px"
                    }}
                >

                    <div
                        style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            background: "#2858dd",
                            color: "#fff",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "42px",
                            fontWeight: "bold"
                        }}
                    >

                        {user.name.charAt(0).toUpperCase()}

                    </div>

                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px"
                    }}
                >

                    <div className="control-card">

                        <h3>Name</h3>

                        <p>{user.name}</p>

                    </div>

                    <div className="control-card">

                        <h3>Email</h3>

                        <p>{user.email}</p>

                    </div>

                    <div className="control-card">

                        <h3>Role</h3>

                        <p
                            style={{
                                textTransform: "capitalize",
                                fontWeight: "bold",
                                color: "#2858dd"
                            }}
                        >
                            {user.role}
                        </p>

                    </div>

                    <div className="control-card">

                        <h3>Member Since</h3>

                        <p>

                            {new Date(
                                user.createdAt
                            ).toLocaleDateString()}

                        </p>

                    </div>

                </div>

                {user.role === "aspirant" && (
                    <div className="control-card" style={{ marginTop: "20px", background: "var(--surface-soft)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                            <div>
                                <h3 style={{ margin: "0 0 6px" }}>🎯 My Fields of Interest</h3>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                                    {user.interests && user.interests.length > 0 ? (
                                        user.interests.map((interest, idx) => (
                                            <span
                                                key={idx}
                                                style={{
                                                    background: "var(--primary-soft)",
                                                    color: "var(--primary)",
                                                    padding: "4px 10px",
                                                    borderRadius: "999px",
                                                    fontSize: "0.82rem",
                                                    fontWeight: "600"
                                                }}
                                            >
                                                {interest}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No interests selected yet.</span>
                                    )}
                                </div>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/aspirant/select-interests")}
                                style={{ padding: "8px 16px", fontSize: "0.88rem" }}
                            >
                                ⚙️ Edit Interests
                            </button>
                        </div>
                    </div>
                )}

                <hr
                    style={{
                        margin: "35px 0"
                    }}
                />

                <h2>Change Password</h2>

                <br />

                <div className="control-card">

                    <label>Current Password</label>

                    <br />

                    <input
                        type={showCurrent ? "text" : "password"}
                        className="input-field"
                        value={currentPassword}
                        onChange={(e) =>
                            setCurrentPassword(e.target.value)
                        }
                    />

                    <button
                        className="btn btn-outline"
                        style={{ marginTop: "8px" }}
                        onClick={() =>
                            setShowCurrent(!showCurrent)
                        }
                    >
                        {showCurrent ? "Hide" : "Show"}
                    </button>

                </div>

                <br />

                <div className="control-card">

                    <label>New Password</label>

                    <br />

                    <input
                        type={showNew ? "text" : "password"}
                        className="input-field"
                        value={newPassword}
                        onChange={(e) =>
                            setNewPassword(e.target.value)
                        }
                    />

                    <button
                        className="btn btn-outline"
                        style={{ marginTop: "8px" }}
                        onClick={() =>
                            setShowNew(!showNew)
                        }
                    >
                        {showNew ? "Hide" : "Show"}
                    </button>

                </div>

                <br />

                <div className="control-card">

                    <label>Confirm Password</label>

                    <br />

                    <input
                        type={showConfirm ? "text" : "password"}
                        className="input-field"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                    />

                    <button
                        className="btn btn-outline"
                        style={{ marginTop: "8px" }}
                        onClick={() =>
                            setShowConfirm(!showConfirm)
                        }
                    >
                        {showConfirm ? "Hide" : "Show"}
                    </button>

                </div>

                <br />

                <button
                    className="btn btn-primary"
                    disabled={saving}
                    onClick={changePassword}
                >
                    {saving ? "Updating..." : "Update Password"}
                </button>

            </section>

        </main>

    );

};

export default Profile;