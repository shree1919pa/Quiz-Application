const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdminAndMigrate = async () => {
    try {
        const adminEmail = (process.env.ADMIN_EMAIL || "admin17@gmail.com").toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1905";

        // 1. Safe migration for existing examiners:
        // Set approvalStatus to "approved" for existing examiners without approvalStatus
        await User.updateMany(
            { role: "examiner", approvalStatus: { $exists: false } },
            { $set: { approvalStatus: "approved", approvedAt: new Date() } }
        );

        // Ensure isBlocked is set to false for existing users where missing
        await User.updateMany(
            { isBlocked: { $exists: false } },
            { $set: { isBlocked: false } }
        );

        // 2. Ensure Admin User exists and credentials are up to date
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await User.create({
                name: "Administrator",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                approvalStatus: "approved",
                isBlocked: false,
                interests: []
            });
            console.log(`[AdminSeeder] Admin account initialized for ${adminEmail}`);
        } else {
            // Update role, approvalStatus, isBlocked if needed
            let needsUpdate = false;
            if (existingAdmin.role !== "admin") {
                existingAdmin.role = "admin";
                needsUpdate = true;
            }
            if (existingAdmin.approvalStatus !== "approved") {
                existingAdmin.approvalStatus = "approved";
                needsUpdate = true;
            }
            if (existingAdmin.isBlocked !== false) {
                existingAdmin.isBlocked = false;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await existingAdmin.save();
                console.log(`[AdminSeeder] Admin account permissions synchronized for ${adminEmail}`);
            }
        }
    } catch (error) {
        console.error("[AdminSeeder] Error during admin seeding and migration:", error.message);
    }
};

module.exports = { seedAdminAndMigrate };
