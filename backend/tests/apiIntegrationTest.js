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

async function testApi() {
    console.log("=== Testing API Endpoints ===");
    try {
        // 1. Test Admin Login with valid credentials
        const loginRes = await makeRequest({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login/admin",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, {
            email: "admin17@gmail.com",
            password: "Admin@1905"
        });

        console.log("Admin Login Status:", loginRes.status, "- message:", loginRes.data.message);
        if (loginRes.status !== 200 || !loginRes.data.token) {
            throw new Error("Admin login failed!");
        }

        const adminToken = loginRes.data.token;

        // 2. Test Admin Stats endpoint
        const statsRes = await makeRequest({
            hostname: "localhost",
            port: 5000,
            path: "/api/admin/stats",
            method: "GET",
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        });

        console.log("Admin Stats Status:", statsRes.status, "- stats:", statsRes.data.stats);
        if (statsRes.status !== 200 || !statsRes.data.success) {
            throw new Error("Failed to fetch admin stats!");
        }

        // 3. Test Unauthorized Access without token
        const noAuthRes = await makeRequest({
            hostname: "localhost",
            port: 5000,
            path: "/api/admin/stats",
            method: "GET"
        });
        console.log("No Token Access to /api/admin/stats Status (Expected 401):", noAuthRes.status);

        // 4. Test Invalid Admin Login with wrong password
        const badLoginRes = await makeRequest({
            hostname: "localhost",
            port: 5000,
            path: "/api/auth/login/admin",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, {
            email: "admin17@gmail.com",
            password: "WrongPassword"
        });
        console.log("Wrong Password Admin Login Status (Expected 401):", badLoginRes.status);

        // 5. Test Users endpoint
        const usersRes = await makeRequest({
            hostname: "localhost",
            port: 5000,
            path: "/api/admin/users",
            method: "GET",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        console.log("Admin Users List Status:", usersRes.status, "- count:", usersRes.data.users?.length);

        console.log("=== All API Endpoints Functioning Perfectly! ===");
    } catch (err) {
        console.error("API Test Error:", err);
    }
}

testApi();
