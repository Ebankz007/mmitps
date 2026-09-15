const https = require('http'); // Using http instead of https for localhost if no SSL
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:5005/api/v1';

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
// const put = (path, body, token) => request('PUT', path, body, token);
// const del = (path, token) => request('DELETE', path, null, token);


async function runTest() {
    console.log('🚀 Starting Milestone 3 Verification: Subscriptions & Plans');
    console.log('---------------------------------------------------------');

    // 1. Register User (User Role to subscribe)
    const uniqueId = Date.now().toString().slice(-6);
    const userEmail = `subuser.${uniqueId}@example.com`;
    const userPass = 'Password123!';

    console.log(`\n--- 1. Registering User: ${userEmail} ---`);
    const regRes = await post('/auth/register', {
        email: userEmail,
        password: userPass,
        username: `subuser.${uniqueId}`
    });

    if (regRes.status !== 201) {
        console.error('Registration failed:', regRes.body);
        process.exit(1);
    }
    const userToken = regRes.body.data.tokens.access.token;
    console.log('User Token acquired');

    // 2. Register Admin (To create plans)
    const adminEmail = `admin.${uniqueId}@example.com`;
    console.log(`\n--- 2. Registering Admin: ${adminEmail} ---`);
    const adminRegRes = await post('/auth/register', {
        email: adminEmail,
        password: userPass,
        username: `admin.${uniqueId}`,
        // role: 'admin' // In real app, can't register as admin directly usually. 
        // For testing, we might need to seed an admin or assume we have one.
        // Or we can register and then hack the DB manually? 
        // Or maybe our dev setup allows 'role': 'admin'? Let's try.
        role: 'admin'
    });

    // Note: If Role middleware prevents 'admin' registration, this will fail or ignore role.
    // If it ignores, we proceed as 'user'. 
    // BUT we need admin to create plans.
    // Let's assume for this test environment we can register as admin or use a seed. 
    // If this fails, we'll need a fallback strategy (manual DB update).

    let adminToken = adminRegRes.body.data.tokens.access.token;
    console.log('Admin Token acquired');

    if (adminRegRes.body.data.user.role !== 'admin') {
        console.warn('⚠️ Registering as admin via API might be restricted. Using User token for now, expecting failure on Plan Create.');
        // In a real verification script, we'd probably login as a pre-seeded Super Admin.
    }

    // 3. Create Plan (Admin)
    console.log(`\n--- 3. Creating Plan "Pro-${uniqueId}" ---`);
    const planCode = `PRO-${uniqueId}`;
    const planRes = await post('/admin/plans', {
        name: 'Pro', // Must match enum ['Basic', 'Pro', 'Institutional']
        code: planCode,
        price: 29.99,
        interval: 'month',
        features: { 'bots': true }
    }, adminToken);

    if (planRes.status === 403) {
        console.error('⛔ Permission denied: Need Admin role to create plans.');
        console.log('Skipping Plan Creation verification due to permission issues in test script.');
        // We'll try to find an existing plan or skip
    } else if (planRes.status === 201) {
        console.log('✅ Plan Created:', planRes.body.data.name);
    } else {
        console.log('Plan Create Status:', planRes.status);
        console.log('Response:', planRes.body);
    }

    // 4. Subscribe User to Plan
    console.log(`\n--- 4. User Subscribing to ${planCode} ---`);
    // Route in server.js should be mounted. If mounted at /api/v1/subscriptions:
    const subRes = await post('/subscriptions/subscribe', {
        planCode: planCode
    }, userToken);

    if (subRes.status === 201) {
        console.log('✅ Subscribed successfully. Status:', subRes.body.data.status);
    } else {
        console.log('Subscription Failed:', subRes.status);
        console.log('Response:', subRes.body);
    }

    // 5. Get My Subscription
    console.log('\n--- 5. Getting My Subscription ---');
    const mySubRes = await get('/subscriptions/my-subscription', userToken);

    if (mySubRes.status === 200) {
        console.log('✅ Subscription Retrieved:', mySubRes.body.data ? mySubRes.body.data.status : 'None');
    } else {
        console.log('Get Sub Failed:', mySubRes.status);
    }

    // 6. Cancel Subscription
    console.log('\n--- 6. Canceling Subscription ---');
    const cancelRes = await post('/subscriptions/cancel', {}, userToken);

    if (cancelRes.status === 200) {
        console.log('✅ Subscription Canceled');
    } else {
        console.log('Cancel Failed:', cancelRes.status);
    }

    console.log('\n---------------------------------------------------------');
    console.log('End Verification');
}

runTest().catch(console.error);
