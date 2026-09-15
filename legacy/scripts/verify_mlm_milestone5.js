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

async function runTest() {
    console.log('🚀 Starting Milestone 5 Verification: MLM System');
    console.log('---------------------------------------------------------');

    const uniqueId = Date.now().toString().slice(-6);

    // 1. Register Root Sponsor
    console.log(`\n--- 1. Registering Root Sponsor ---`);
    const rootEmail = `root.${uniqueId}@example.com`;
    const rootRes = await post('/auth/register', {
        email: rootEmail,
        password: 'Password123!',
        username: `root.${uniqueId}`
    });
    const rootToken = rootRes.body.data.tokens.access.token;
    const rootId = rootRes.body.data.user._id;
    console.log('Root User Created:', rootId);

    // 2. Register Admin
    console.log(`\n--- 2. Registering Admin ---`);
    const adminRes = await post('/auth/register', {
        email: `admin.${uniqueId}@example.com`,
        password: 'Password123!',
        username: `admin.${uniqueId}`,
        role: 'admin'
    });
    const adminToken = adminRes.body.data.tokens.access.token;

    // 3. Create Root Node (using Admin)
    console.log('\n--- 3. Creating Root Node ---');
    const rootNodeRes = await post('/mlm/root', { userId: rootId }, adminToken);

    if (rootNodeRes.status === 201) {
        console.log('✅ Root Node Created');
    } else {
        console.log('❌ Root Creation Failed:', rootNodeRes.status, JSON.stringify(rootNodeRes.body, null, 2));
    }

    // 4. Register Recruit 1 (to be placed under Root)
    console.log('\n--- 4. Registering Recruit 1 ---');
    const recruit1Res = await post('/auth/register', {
        email: `recruit1.${uniqueId}@example.com`,
        password: 'Password123!',
        username: `recruit1.${uniqueId}`
    });
    const recruit1Id = recruit1Res.body.data.user._id;
    console.log('Recruit 1 ID:', recruit1Id);

    // 5. Place Recruit 1 (Admin force placement for test)
    console.log('\n--- 5. Placing Recruit 1 under Root ---');
    const placeRes = await post('/mlm/placement', {
        userId: recruit1Id,
        sponsorId: rootId,
        strategy: 'left'
    }, adminToken);

    if (placeRes.status === 200) {
        console.log('✅ Recruit 1 Placed:', placeRes.body.data.position);
    } else {
        console.log('❌ Placement Failed:', placeRes.status, JSON.stringify(placeRes.body, null, 2));
    }

    // 6. Verify Tree Structure
    console.log('\n--- 6. Verifying Tree Structure ---');
    const treeRes = await get('/mlm/tree', rootToken);
    console.log('Root Tree Children:', treeRes.body.data.leftChild ? 'Left Child Exists' : 'No Left Child');

    console.log('\n---------------------------------------------------------');
    console.log('End Verification');
}

runTest().catch(console.error);
