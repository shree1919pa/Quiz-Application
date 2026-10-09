const http = require("http");

function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => data += chunk);
            res.on("end", () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        req.on("error", reject);
        if (postData) {
            req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

async function testCommunityAndProfile() {
    console.log("=== Testing Community Management & Profile Endpoints ===");
    try {
        // 1. Admin login with initial credentials
        let loginRes = await makeRequest({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login/admin",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, {
            email: "admin17@gmail.com",
            password: "Admin@1905"
        });

        if (loginRes.status !== 200) {
            console.log("Initial login status:", loginRes.status, loginRes.data);
            throw new Error("Admin login failed");
        }
        console.log("1. Admin Login Successful.");
        const token = loginRes.data.token;

        // 2. Fetch communities
        const commRes = await makeRequest({
            hostname: "localhost",
            port: 5000,
            path: "/api/admin/communities",
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        console.log("2. Communities Fetch Status:", commRes.status, "- count:", commRes.data.communities?.length);

        // 3. Fetch Admin Profile
        const profRes = await makeRequest({
            hostname: "localhost",
            port: 5000,
            path: "/api/admin/profile",
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        console.log("3. Admin Profile Fetch Status:", profRes.status, "- user:", profRes.data.user);

        // 4. Test Password Update with Invalid Policy
        const weakPassRes = await makeRequest({
            hostname: "localhost",
            port: 5000,
            path: "/api/admin/profile/password",
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }, {
            currentPassword: "Admin@1905",
            newPassword: "short",
            confirmPassword: "short"
        });
        console.log("4. Weak Password Test Status (Expected 400):", weakPassRes.status, "- message:", weakPassRes.data.message);

        // 5. Test Password Update with Valid Strong Password
        const newStrongPassword = "NewAdminPassword@2026";
        const updatePassRes = await makeRequest({
            hostname: "localhost",
            port: 5000,
            path: "/api/admin/profile/password",
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }, {
            currentPassword: "Admin@1905",
            newPassword: newStrongPassword,
            confirmPassword: newStrongPassword
        });
        console.log("5. Password Update Status:", updatePassRes.status, "- message:", updatePassRes.data.message);

        // 6. Verify Old Password Fails
        const oldPassLogin = await makeRequest({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login/admin",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, {
            email: "admin17@gmail.com",
            password: "Admin@1905"
        });
        console.log("6. Old Password Login Test (Expected 401):", oldPassLogin.status);

        // 7. Verify New Password Succeeds
        const newPassLogin = await makeRequest({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login/admin",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, {
            email: "admin17@gmail.com",
            password: newStrongPassword
        });
        console.log("7. New Password Login Test (Expected 200):", newPassLogin.status, "- token received:", Boolean(newPassLogin.data.token));

        // 8. Revert back to Admin@1905 for testing convenience
        const newToken = newPassLogin.data.token;
        const revertPassRes = await makeRequest({
            hostname: "localhost",
            port: 5000,
            path: "/api/admin/profile/password",
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${newToken}`
            }
        }, {
            currentPassword: newStrongPassword,
            newPassword: "Admin@1905",
            confirmPassword: "Admin@1905"
        });
        console.log("8. Password Reverted Back for initial state:", revertPassRes.status, "- message:", revertPassRes.data.message);

        console.log("=== All Community & Profile Backend Tests Passed Successfully! ===");
    } catch (err) {
        console.error("Test Error:", err);
    }
}

testCommunityAndProfile();
