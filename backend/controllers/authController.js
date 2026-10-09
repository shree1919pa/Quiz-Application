const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// Register Aspirant
// ==========================================
const registerAspirant = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const exist = await User.findOne({ email: normalizedEmail });

        if (exist) {
            return res.status(400).json({
                message: "User already exists with this email"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashPassword,
            role: "aspirant",
            approvalStatus: "approved",
            isBlocked: false,
            interests: []
        });

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "Aspirant Account Created",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                interests: user.interests || []
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ==========================================
// Register Examiner (Pending Admin Approval)
// ==========================================
const registerExaminer = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const exist = await User.findOne({ email: normalizedEmail });

        if (exist) {
            return res.status(400).json({
                message: "User already exists with this email"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashPassword,
            role: "examiner",
            approvalStatus: "pending",
            isBlocked: false,
            approvedAt: null,
            approvedBy: null
        });

        res.status(201).json({
            message: "Examiner registration submitted successfully. Your account is pending administrator approval before you can log in.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                approvalStatus: user.approvalStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ==========================================
// Login Aspirant
// ==========================================
const loginAspirant = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({
            email: normalizedEmail,
            role: "aspirant"
        });

        if (!user) {
            return res.status(404).json({
                message: "Aspirant account not found"
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                message: "Your account has been blocked by the administrator."
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Aspirant Login Success",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                interests: user.interests || []
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ==========================================
// Login Examiner
// ==========================================
const loginExaminer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({
            email: normalizedEmail,
            role: "examiner"
        });

        if (!user) {
            return res.status(404).json({
                message: "Examiner account not found"
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                message: "Your account has been blocked by the administrator."
            });
        }

        if (user.approvalStatus === "pending") {
            return res.status(403).json({
                message: "Your examiner account is pending approval by the administrator."
            });
        }

        if (user.approvalStatus === "rejected") {
            return res.status(403).json({
                message: "Your examiner account registration was rejected by the administrator."
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Examiner Login Success",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                approvalStatus: user.approvalStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ==========================================
// Login Admin (Separate Secure Flow)
// ==========================================
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Admin email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const adminUser = await User.findOne({
            email: normalizedEmail,
            role: "admin"
        });

        if (!adminUser) {
            return res.status(401).json({
                message: "Invalid administrator credentials"
            });
        }

        if (adminUser.isBlocked) {
            return res.status(403).json({
                message: "Administrator access is disabled"
            });
        }

        const match = await bcrypt.compare(password, adminUser.password);

        if (!match) {
            return res.status(401).json({
                message: "Invalid administrator credentials"
            });
        }

        const token = jwt.sign(
            {
                id: adminUser._id,
                role: "admin",
                name: adminUser.name,
                email: adminUser.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Admin Login Successful",
            token,
            user: {
                id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: "admin"
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    registerAspirant,
    registerExaminer,
    loginAspirant,
    loginExaminer,
    loginAdmin
};