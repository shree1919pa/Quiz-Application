import { useState } from "react";
import { apiFetch } from "../../services/api";

const CreateCommunityModal = ({
    open,
    onClose,
    onSuccess
}) => {

    const [formData, setFormData] = useState({

        name: "",

        description: "",

        category: "Others",

        visibility: "public",

        password: ""

    });

    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const createCommunity = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            await apiFetch(

                "/community/create",

                {

                    method: "POST",

                    body: JSON.stringify(formData)

                }

            );

            alert("Community created successfully.");

            setFormData({

                name: "",

                description: "",

                category: "Others",

                visibility: "public",

                password: ""

            });

            onClose();

            onSuccess();

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
                background: "rgba(0,0,0,.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999
            }}
        >

            <div
                className="card-panel"
                style={{
                    width: "650px",
                    maxWidth: "95%"
                }}
            >

                <h2>Create Quiz Community</h2>

                <form onSubmit={createCommunity}>

                    <label>Community Name</label>

                    <input
                        type="text"
                        name="name"
                        className="input-field"
                        placeholder="Enter Community Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <br />

                    <label>Description</label>

                    <textarea
                        name="description"
                        className="input-field"
                        rows="3"
                        placeholder="Community Description"
                        value={formData.description}
                        onChange={handleChange}
                    />

                    <br />

                    <label>Category</label>

                    <select
                        name="category"
                        className="input-field"
                        value={formData.category}
                        onChange={handleChange}
                    >

                        <option>Programming</option>

                        <option>Engineering</option>

                        <option>Medical</option>

                        <option>Government Exams</option>

                        <option>Placement</option>

                        <option>School</option>

                        <option>College</option>

                        <option>Others</option>

                    </select>

                    <br />

                    <label>Visibility</label>

                    <select
                        name="visibility"
                        className="input-field"
                        value={formData.visibility}
                        onChange={handleChange}
                    >

                        <option value="public">

                            🌍 Public

                        </option>

                        <option value="private">

                            🔒 Private

                        </option>

                    </select>

                    {

                        formData.visibility === "private" && (

                            <>

                                <br />

                                <label>Community Password</label>

                                <input
                                    type="password"
                                    name="password"
                                    className="input-field"
                                    placeholder="Enter Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

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
                            type="button"
                            className="btn btn-outline"
                            onClick={onClose}
                        >

                            Cancel

                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >

                            {

                                loading

                                    ? "Creating..."

                                    : "Create Community"

                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

};

export default CreateCommunityModal;