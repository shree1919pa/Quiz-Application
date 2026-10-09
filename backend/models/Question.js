const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
{
    quizId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Quiz"
    },

    questionType:{
        type:String,
        enum:["MCQ","Theory"]
    },

    question:{
        type:String,
        required:true
    },

    options:[
        String
    ],

    correctAnswer:{
        type:String
    },

    marks:{
        type:Number,
        default:1
    }
},
{
    timestamps:true
});

module.exports =
mongoose.model("Question",questionSchema);