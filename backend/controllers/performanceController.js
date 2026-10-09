const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

/*
====================================================
GET MY PERFORMANCE
GET /api/performance
====================================================
*/

const getMyPerformance = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            search = "",
            status = "all",
            sortBy = "date",
            order = "desc",
            page = 1,
            limit = 10
        } = req.query;

        const attempts = await Attempt.find({

            aspirantId: userId

        })

            .populate({

                path: "quizId",

                select: "title quizCode"

            })

            .sort({

                createdAt: -1

            });

        let records = attempts.map((attempt, index) => {

            return {

                _id: attempt._id,

                quizId: attempt.quizId?._id || null,

                title: attempt.quizId?.title || "Deleted Quiz",

                quizCode: attempt.quizId?.quizCode || "N/A",

                score: attempt.score,

                totalMarks: attempt.totalMarks,

                percentage: Number(attempt.percentage.toFixed(2)),

                result: attempt.percentage >= 40
                    ? "PASS"
                    : "FAIL",

                attemptNumber: index + 1,

                createdAt: attempt.createdAt

            };

        });

        /*
        -------------------------
        SEARCH
        -------------------------
        */

        if (search) {

            const value = search.toLowerCase();

            records = records.filter((item) =>

                item.title.toLowerCase().includes(value) ||

                item.quizCode.toLowerCase().includes(value)

            );

        }

        /*
        -------------------------
        FILTER
        -------------------------
        */

        if (status !== "all") {

            records = records.filter((item) =>

                item.result.toLowerCase() === status.toLowerCase()

            );

        }

        /*
        -------------------------
        SORT
        -------------------------
        */

        records.sort((a, b) => {

            let x;
            let y;

            switch (sortBy) {

                case "name":

                    x = a.title.toLowerCase();

                    y = b.title.toLowerCase();

                    break;

                case "percentage":

                    x = a.percentage;

                    y = b.percentage;

                    break;

                default:

                    x = new Date(a.createdAt);

                    y = new Date(b.createdAt);

            }

            if (x < y)
                return order === "asc" ? -1 : 1;

            if (x > y)
                return order === "asc" ? 1 : -1;

            return 0;

        });

        /*
        -------------------------
        STATISTICS
        -------------------------
        */

        const totalQuiz = records.length;

        const highestScore =

            totalQuiz > 0

                ? Math.max(...records.map(r => r.percentage))

                : 0;

        const averageScore =

            totalQuiz > 0

                ? (

                    records.reduce(

                        (sum, r) => sum + r.percentage,

                        0

                    ) / totalQuiz

                ).toFixed(2)

                : 0;

        const passed =

            records.filter(

                r => r.result === "PASS"

            ).length;

        const failed =

            records.filter(

                r => r.result === "FAIL"

            ).length;

        /*
        -------------------------
        PAGINATION
        -------------------------
        */

        const start =

            (Number(page) - 1) * Number(limit);

        const end =

            start + Number(limit);

        const paginated =

            records.slice(start, end);

        res.status(200).json({

            success: true,

            statistics: {

                totalQuiz,

                highestScore,

                averageScore,

                passed,

                failed

            },

            pagination: {

                currentPage: Number(page),

                totalPages: Math.ceil(

                    totalQuiz / limit

                ),

                totalRecords: totalQuiz

            },

            performance: paginated

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/*
====================================================
VIEW ONE ATTEMPT
GET /api/performance/:attemptId
====================================================
*/

const getPerformanceDetails = async (req, res) => {

    try {

        const { attemptId } = req.params;

        const userId = req.user.id;

        const attempt = await Attempt.findOne({

            _id: attemptId,

            aspirantId: userId

        })

            .populate({

                path: "quizId",

                select: "title quizCode"

            })

            .populate({

                path: "answers.questionId",

                select: "question options correctAnswer marks questionType"

            });

        if (!attempt) {

            return res.status(404).json({

                message: "Attempt not found."

            });

        }

        res.status(200).json({

            success: true,

            attempt

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    getMyPerformance,

    getPerformanceDetails

};