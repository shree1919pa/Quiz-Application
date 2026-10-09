import { useState } from "react";

const MemberCard = ({
    member,
    currentUserRole,
    onRemove,
    onTransferOwnership,
    onToggleModerator
}) => {

    const [loading, setLoading] = useState(false);

    const handleRemove = async () => {

        if (!window.confirm(`Remove ${member.examinerName}?`)) {

            return;

        }

        try {

            setLoading(true);

            await onRemove(member);

        }

        finally {

            setLoading(false);

        }

    };

    const handleTransfer = async () => {

        if (

            !window.confirm(

                `Transfer ownership to ${member.examinerName}?`

            )

        ) {

            return;

        }

        try {

            setLoading(true);

            await onTransferOwnership(member);

        }

        finally {

            setLoading(false);

        }

    };

    const handleModerator = async () => {

        try {

            setLoading(true);

            await onToggleModerator(member);

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div
            className="control-card"
            style={{
                marginBottom: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px"
            }}
        >

            <div>

                <h3>

                    {member.examinerName}

                </h3>

                <p>

                    {member.examinerEmail}

                </p>

                <span
                    style={{
                        padding: "5px 12px",
                        borderRadius: "20px",
                        background:

                            member.role === "owner"

                                ? "#d4edda"

                                : member.role === "moderator"

                                ? "#e3f2fd"

                                : "#f5f5f5",

                        color:

                            member.role === "owner"

                                ? "green"

                                : member.role === "moderator"

                                ? "#1565c0"

                                : "#444",

                        fontWeight: "bold"
                    }}
                >

                    {

                        member.role === "owner"

                            ? "👑 Owner"

                            : member.role === "moderator"

                            ? "🛡 Moderator"

                            : "👨‍🏫 Examiner"

                    }

                </span>

            </div>

            {

                currentUserRole === "owner" &&

                member.role !== "owner" &&

                (

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap"
                        }}
                    >

                        <button
                            className="btn btn-outline"
                            onClick={handleModerator}
                            disabled={loading}
                        >

                            {

                                member.role === "moderator"

                                    ? "Remove Moderator"

                                    : "Make Moderator"

                            }

                        </button>

                        <button
                            className="btn btn-warning"
                            onClick={handleTransfer}
                            disabled={loading}
                        >

                            Transfer Owner

                        </button>

                        <button
                            className="btn btn-danger"
                            onClick={handleRemove}
                            disabled={loading}
                        >

                            Remove

                        </button>

                    </div>

                )

            }

        </div>

    );

};

export default MemberCard;