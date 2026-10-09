const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:true
    },

    role:{
        type:String,
        enum:["examiner","aspirant","admin"],
        required:true
    },

    approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "approved"
    },

    approvedAt: {
        type: Date,
        default: null
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    isBlocked: {
        type: Boolean,
        default: false
    },

    interests: [
        {
            type: String,
            trim: true
        }
    ]
},
{
    timestamps:true
});

module.exports = mongoose.model("User",userSchema);