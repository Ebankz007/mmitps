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
    console.log('🚀 Starting Milestone 8 Verification: Trading Features');
    console.log('---------------------------------------------------------');

    const uniqueId = Date.now().toString().slice(-6);

    // 1. Register Provider
    console.log(`\n--- 1. Registering Provider ---`);
    const providerRes = await post('/auth/register', {
        email: `provider.${uniqueId}@example.com`,
        password: 'Password123!',
        username: `provider.${uniqueId}`,
        role: 'admin' // Use admin for simplicity in testing role-based routes
    });
    const providerToken = providerRes.body.data.tokens.access.token;
    const providerId = providerRes.body.data.user._id;
    console.log('Provider Registered. ID:', providerId);

    // 2. Create Trading Signal
    console.log(`\n--- 2. Creating Signal 'BTC/USD BUY' ---`);
    const signalRes = await post('/trading/signals', {
        pair: 'BTC/USD',
        type: 'buy',
        entryPrice: 50000,
        stopLoss: 48000,
        takeProfit: [52000, 55000],
        analysis: 'Bullish divergence on 4H chart.'
    }, providerToken);

    if (signalRes.status === 201) {
        console.log('✅ Signal Created. ID:', signalRes.body.data._id);
    } else {
        console.log('❌ Signal Creation Failed:', signalRes.status, JSON.stringify(signalRes.body, null, 2));
        return;
    }
    const signalId = signalRes.body.data._id;

    // 3. Register Follower
    console.log(`\n--- 3. Registering Follower ---`);
    const followerRes = await post('/auth/register', {
        email: `follower.${uniqueId}@example.com`,
        password: 'Password123!',
        username: `follower.${uniqueId}`
    });
    const followerToken = followerRes.body.data.tokens.access.token;
    console.log('Follower Registered');

    // 4. Fund Follower Wallet ($2000)
    console.log(`\n--- 4. Funding Follower Wallet ($2000) ---`);
    await post('/financial/wallet/deposit', {
        amount: 2000,
        currency: 'USD',
        method: 'card'
    }, followerToken);
    console.log('✅ Wallet Funded');

    // 5. Follow Provider ($1000 allocation)
    console.log(`\n--- 5. Following Provider with $1000 ---`);
    const followRes = await post('/trading/copy/follow', {
        providerId: providerId,
        amount: 1000
    }, followerToken);

    if (followRes.status === 200) {
        console.log('✅ Follow Successful. Status:', followRes.body.data.status);
    } else {
        console.log('❌ Follow Failed:', followRes.status, JSON.stringify(followRes.body, null, 2));
    }

    // 6. Verify Subscriptions
    console.log(`\n--- 6. Verifying My Subscriptions ---`);
    const subsRes = await get('/trading/copy/my-subscriptions', followerToken);
    console.log('Total Subscriptions:', subsRes.body.data.length);

    // 7. Verify Remaining Wallet Balance
    console.log(`\n--- 7. Verifying Remaining Wallet Balance ---`);
    const walletRes = await get('/financial/wallet/balance?currency=USD', followerToken);
    console.log('Available Balance:', walletRes.body.data.balance); // Should be $1000 ($2000 - $1000)

    console.log('\n---------------------------------------------------------');
    console.log('End Verification');
}

runTest().catch(console.error);
