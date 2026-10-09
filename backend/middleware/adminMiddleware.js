const { verifyToken, adminOnly } = require("./authMiddleware");

const verifyAdmin = [verifyToken, adminOnly];

module.exports = {
    verifyAdmin,
    adminOnly
};
