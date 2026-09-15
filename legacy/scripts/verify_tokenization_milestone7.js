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

async function runTest() {
    console.log('🚀 Starting Milestone 7 Verification: Tokenization System');
    console.log('---------------------------------------------------------');

    const uniqueId = Date.now().toString().slice(-6);

    // 1. Register Admin
    console.log(`\n--- 1. Registering Admin ---`);
    const adminRes = await post('/auth/register', {
        email: `admin.token.${uniqueId}@example.com`,
        password: 'Password123!',
        username: `admintoken.${uniqueId}`,
        role: 'admin'
    });
    const adminToken = adminRes.body.data.tokens.access.token;
    console.log('Admin Token Acquired');

    // 2. Create Token Pool
    console.log(`\n--- 2. Creating Token Pool 'Prime Real Estate' ---`);
    const poolRes = await post('/tokenization/pools', {
        name: `Prime Real Estate ${uniqueId}`,
        description: 'Investment in a luxury apartment complex.',
        assetType: 'real_estate',
        totalTokenSupply: 1000,
        tokenPrice: 50, // $50 per token
        minInvestment: 5,
        status: 'open',
        startDate: new Date()
    }, adminToken);

    if (poolRes.status === 201) {
        console.log('✅ Pool Created. ID:', poolRes.body.data._id);
    } else {
        console.log('❌ Pool Creation Failed:', poolRes.status, JSON.stringify(poolRes.body, null, 2));
        return;
    }
    const poolId = poolRes.body.data._id;

    // 3. Register Investor
    console.log(`\n--- 3. Registering Investor ---`);
    const investorRes = await post('/auth/register', {
        email: `investor.${uniqueId}@example.com`,
        password: 'Password123!',
        username: `investor.${uniqueId}`
    });
    const investorToken = investorRes.body.data.tokens.access.token;
    const investorId = investorRes.body.data.user._id;
    console.log('Investor Registered. ID:', investorId);

    // 4. Fund Investor Wallet (Deposit $1000)
    console.log(`\n--- 4. Funding Investor Wallet ($1000) ---`);
    await post('/financial/wallet/deposit', {
        amount: 1000,
        currency: 'USD',
        method: 'card'
    }, investorToken);
    console.log('✅ Wallet Funded');

    // 5. Invest in Pool ($500 = 10 tokens)
    console.log(`\n--- 5. Investing $500 in Pool ---`);
    const investRes = await post('/tokenization/invest', {
        poolId: poolId,
        amount: 500
    }, investorToken);

    if (investRes.status === 200) {
        console.log('✅ Investment Successful. Tokens:', investRes.body.data.tokensPurchased);
    } else {
        console.log('❌ Investment Failed:', investRes.status, JSON.stringify(investRes.body, null, 2));
    }

    // 6. Verify User Investments
    console.log(`\n--- 6. Verifying My Investments ---`);
    const myInvestRes = await get('/tokenization/my-investments', investorToken);
    console.log('Total Investments:', myInvestRes.body.data.length);

    // 7. Verify Remaining Balance
    console.log(`\n--- 7. Verifying Remaining Wallet Balance ---`);
    const walletRes = await get('/financial/wallet/balance?currency=USD', investorToken);
    console.log('Available Balance:', walletRes.body.data.balance); // Should be $500 ($1000 - $500)

    console.log('\n---------------------------------------------------------');
    console.log('End Verification');
}

runTest().catch(console.error);
