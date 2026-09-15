const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:5006/api/v1';

// Helper for making requests
function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(`${BASE_URL}${path}`, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

// Helpers
const get = (path, token) => request('GET', path, null, token);
const post = (path, body, token) => request('POST', path, body, token);
const patch = (path, body, token) => request('PATCH', path, body, token);

async function runTest() {
    console.log('🚀 Starting Milestone 10 Verification: Admin Dashboard & Analytics');
    console.log('---------------------------------------------------------');

    const uniqueId = Date.now().toString().slice(-6);

    // 1. Register Admin
    console.log(`\n--- 1. Registering Admin ---`);
    const adminRes = await post('/auth/register', {
        email: `superadmin.${uniqueId}@example.com`,
        password: 'Password123!',
        username: `superadmin.${uniqueId}`,
        role: 'admin'
    });
    const adminToken = adminRes.body.data.tokens.access.token;
    console.log('Admin Authenticated');

    // 2. Register a regular user to manage
    console.log(`\n--- 2. Registering Test User ---`);
    const userRes = await post('/auth/register', {
        email: `testuser.${uniqueId}@example.com`,
        password: 'Password123!',
        username: `testuser.${uniqueId}`
    });
    const targetUserId = userRes.body.data.user._id;
    console.log('Test User Created. ID:', targetUserId);

    // 3. Admin: List Users
    console.log(`\n--- 3. Admin: Listing Users ---`);
    const usersListRes = await get('/admin/users', adminToken);
    if (usersListRes.status === 200) {
        console.log('✅ Users List Retrieved. Count:', usersListRes.body.data.length);
    } else {
        console.log('❌ Failed to list users:', usersListRes.status);
    }

    // 4. Admin: Suspend User
    console.log(`\n--- 4. Admin: Suspending User ---`);
    const suspendRes = await patch(`/admin/users/${targetUserId}/status`, { status: 'suspended' }, adminToken);
    if (suspendRes.status === 200) {
        console.log('✅ User suspended successfully');
    } else {
        console.log('❌ Suspend failed:', suspendRes.status, JSON.stringify(suspendRes.body, null, 2));
    }

    // 5. Admin: Check Analytics Overview
    console.log(`\n--- 5. Admin: Analytics Overview ---`);
    const analyticsRes = await get('/admin/analytics/overview', adminToken);
    if (analyticsRes.status === 200) {
        console.log('✅ Analytics Overview:', JSON.stringify(analyticsRes.body.data, null, 2));
    } else {
        console.log('❌ Analytics retrieval failed:', analyticsRes.status);
    }

    // 6. Admin: Check Audit Logs
    console.log(`\n--- 6. Admin: Audit Logs ---`);
    const logsRes = await get('/admin/logs', adminToken);
    if (logsRes.status === 200) {
        const lastLog = logsRes.body.data[0];
        console.log(`✅ Logs retrieved. Last action: ${lastLog.action}`);
    } else {
        console.log('❌ Logs retrieval failed:', logsRes.status);
    }

    console.log('\n---------------------------------------------------------');
    console.log('End Verification');
}

runTest().catch(console.error);
