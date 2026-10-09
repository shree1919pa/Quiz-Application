import { useState } from "react";
import { apiFetch } from "../../services/api";

const JoinCommunityModal = ({ open, onClose, onSuccess }) => {

    const [communityCode, setCommunityCode] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleJoin = async () => {

        if (!communityCode.trim()) {
            alert("Please enter Community Code.");
            return;
        }

        try {

            setLoading(true);

            const data = await apiFetch("/community/join", {
                method: "POST",
                body: JSON.stringify({
                    communityCode,
                    password
                })
            });

            alert(data.message);

            setCommunityCode("");
            setPassword("");

            onSuccess();
            onClose();

        } catch (error) {

            console.log(error);
            alert(error.message);

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="modal-overlay">

            <div className="modal">

                <h2>Join Community</h2>

                <br />

                <label>

                    Community Code

                    <input
                        className="input-field"
                        value={communityCode}
                        onChange={(e) =>
                            setCommunityCode(e.target.value)
                        }
                    />

                </label>

                <br />

                <label>

                    Password (Only for Private Community)

                    <input
                        type="password"
                        className="input-field"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                </label>

                <br />

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "flex-end"
                    }}
                >

                    <button
                        className="btn btn-outline"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={handleJoin}
                        disabled={loading}
                    >
                        {
                            loading
                                ? "Joining..."
                                : "Join Community"
                        }
                    </button>

                </div>

            </div>

        </div>

    );

};

export default JoinCommunityModal;