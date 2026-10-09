const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        category: {
            type: String,
            default: "Others"
        },

        visibility: {
            type: String,
            enum: ["public", "private"],
            default: "public"
        },

        password: {
            type: String,
            default: null
        },

        communityCode: {
            type: String,
            unique: true,
            required: true
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        ownerName: {
            type: String,
            required: true
        },

        totalMembers: {
            type: Number,
            default: 1
        },

        totalQuizzes: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Community", communitySchema);