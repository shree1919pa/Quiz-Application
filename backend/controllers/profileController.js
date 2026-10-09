const bcrypt = require("bcryptjs");
const User = require("../models/User");

/*
-------------------------------------
GET PROFILE
GET /api/profile
-------------------------------------
*/

const getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.status(200).json({

            user

        });

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

/*
-------------------------------------
CHANGE PASSWORD
PUT /api/profile/password
-------------------------------------
*/

const changePassword = async (req, res) => {

    try {

        const {

            currentPassword,
            newPassword,
            confirmPassword

        } = req.body;

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            return res.status(400).json({

                message: "All fields are required."

            });

        }

        if (newPassword !== confirmPassword) {

            return res.status(400).json({

                message: "Passwords do not match."

            });

        }

        if (newPassword.length < 8) {

            return res.status(400).json({

                message: "Password must contain at least 8 characters."

            });

        }

        const user = await User.findById(req.user.id);

        if (!user) {

            return res.status(404).json({

                message: "User not found."

            });

        }

        const matched = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!matched) {

            return res.status(400).json({

                message: "Current password is incorrect."

            });

        }

        const hashedPassword =
            await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({

            message: "Password updated successfully."

        });

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

/*
-------------------------------------
UPDATE INTERESTS
PUT /api/profile/interests
-------------------------------------
*/

const updateInterests = async (req, res) => {

    try {

        const { interests } = req.body;

        if (!interests || !Array.isArray(interests)) {

            return res.status(400).json({
                success: false,
                message: "Interests must be an array of categories."
            });

        }

        // Clean & trim array items
        const cleanedInterests = interests
            .map(item => String(item).trim())
            .filter(item => item.length > 0);

        const user = await User.findById(req.user.id);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        user.interests = cleanedInterests;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Interests updated successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                interests: user.interests
            }
        });

    } catch (error) {

        console.error("Update Interests Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {

    getProfile,

    changePassword,

    updateInterests

};