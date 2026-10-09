import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";

const EditCommunityModal = ({
    open,
    onClose,
    community,
    onSuccess
}) => {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Programming");
    const [visibility, setVisibility] = useState("public");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        if (!community) return;

        setName(community.name || "");
        setDescription(community.description || "");
        setCategory(community.category || "Programming");
        setVisibility(community.visibility || "public");
        setPassword("");

    }, [community]);

    if (!open) return null;

    const handleSubmit = async () => {

        if (!name.trim()) {

            return alert("Community name is required.");

        }

        if (visibility === "private" && !password.trim()) {

            return alert("Please enter a password.");

        }

        try {

            setLoading(true);

            await apiFetch(

                `/community/${community._id}`,

                {
                    method: "PUT",

                    body: JSON.stringify({

                        name,

                        description,

                        category,

                        visibility,

                        password

                    })

                }

            );

            alert("Community updated successfully.");

            onSuccess();

            onClose();

        }

        catch (error) {

            console.log(error);

            alert(error.message);

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999
            }}
        >

            <div
                className="card-panel"
                style={{
                    width: "550px",
                    maxWidth: "95%"
                }}
            >

                <h2>

                    ✏️ Edit Community

                </h2>

                <hr />

                <label>

                    Community Name

                    <input
                        className="input-field"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />

                </label>

                <br />

                <label>

                    Description

                    <textarea
                        className="input-field"
                        rows="4"
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                    />

                </label>

                <br />

                <label>

                    Category

                    <select
                        className="input-field"
                        value={category}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                    >

                        <option>Programming</option>
                        <option>Engineering</option>
                        <option>Medical</option>
                        <option>Aptitude</option>
                        <option>Reasoning</option>
                        <option>Language</option>

                    </select>

                </label>

                <br />

                <label>

                    Visibility

                    <select
                        className="input-field"
                        value={visibility}
                        onChange={(e) =>
                            setVisibility(e.target.value)
                        }
                    >

                        <option value="public">

                            Public

                        </option>

                        <option value="private">

                            Private

                        </option>

                    </select>

                </label>

                {

                    visibility === "private" && (

                        <>

                            <br />

                            <label>

                                Password

                                <input
                                    type="password"
                                    className="input-field"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />

                            </label>

                        </>

                    )

                }

                <br />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px"
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
                        onClick={handleSubmit}
                        disabled={loading}
                    >

                        {

                            loading

                                ? "Saving..."

                                : "Save Changes"

                        }

                    </button>

                </div>

            </div>

        </div>

    );

};

export default EditCommunityModal;