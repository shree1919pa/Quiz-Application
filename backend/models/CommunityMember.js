const mongoose = require("mongoose");

const communityMemberSchema = new mongoose.Schema(
    {
        communityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            required: true
        },

        examinerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        examinerName: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["owner", "contributor", "member", "student"],
            default: "contributor"
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },


    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "CommunityMember",
    communityMemberSchema
);