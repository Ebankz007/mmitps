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
    console.log('🚀 Starting Milestone 4 Verification: Financial System');
    console.log('---------------------------------------------------------');

    const uniqueId = Date.now().toString().slice(-6);

    // 1. Register User A (Sender)
    console.log(`\n--- 1. Registering User A (Sender) ---`);
    const emailA = `sender.${uniqueId}@example.com`;
    const resA = await post('/auth/register', {
        email: emailA,
        password: 'Password123!',
        username: `sender.${uniqueId}`
    });
    const tokenA = resA.body.data.tokens.access.token;
    const userAId = resA.body.data.user.id; // May need _id from body if structure differs
    console.log('User A Token acquired');

    // 2. Register User B (Recipient)
    console.log(`\n--- 2. Registering User B (Recipient) ---`);
    const emailB = `recipient.${uniqueId}@example.com`;
    const resB = await post('/auth/register', {
        email: emailB,
        password: 'Password123!',
        username: `recipient.${uniqueId}`
    });
    const tokenB = resB.body.data.tokens.access.token;
    console.log('User B Token acquired');

    // 3. User A Deposit (1000 USD)
    console.log(`\n--- 3. User A Deposit (1000 USD) ---`);
    const depositRes = await post('/financial/wallet/deposit', {
        amount: 1000,
        currency: 'USD',
        method: 'card'
    }, tokenA);

    if (depositRes.status === 200) {
        console.log('✅ Deposit Successful. New Balance:', depositRes.body.data.wallet.balances.find(b => b.currency === 'USD').amount);
    } else {
        console.log('❌ Deposit Failed:', depositRes.status, depositRes.body);
    }

    // 4. User A Transfer to User B (200 USD)
    console.log(`\n--- 4. User A Transfer to User B (200 USD) ---`);
    const transferRes = await post('/financial/wallet/transfer', {
        recipientEmail: emailB,
        amount: 200,
        currency: 'USD'
    }, tokenA);

    if (transferRes.status === 200) {
        console.log('✅ Transfer Successful');
    } else {
        console.log('❌ Transfer Failed:', transferRes.status, transferRes.body);
    }

    // 5. User A Withdrawal Request (100 USD)
    console.log(`\n--- 5. User A Withdrawal (100 USD) ---`);
    const withdrawRes = await post('/financial/wallet/withdraw', {
        amount: 100,
        currency: 'USD',
        details: { bank: 'Test Bank', account: '1234567890' }
    }, tokenA);

    if (withdrawRes.status === 200) {
        console.log('✅ Withdrawal Request Successful. Status:', withdrawRes.body.data.status);
    } else {
        console.log('❌ Withdrawal Failed:', withdrawRes.status, withdrawRes.body);
    }

    // 6. Verify Balances
    console.log(`\n--- 6. Verifying Final Balances ---`);

    // User A should have 1000 - 200 - 100 = 700 Available, 100 Frozen? 
    // Wait, withdrawal usually freezes or deducts. My implementation deducts from amount and adds to frozen.
    // So Available amount should be 700.

    const balanceA = await get('/financial/wallet/balance?currency=USD', tokenA);
    console.log('User A Balance:', balanceA.body.data.balance);

    const balanceB = await get('/financial/wallet/balance?currency=USD', tokenB);
    console.log('User B Balance:', balanceB.body.data.balance); // Should be 200

    // 7. Check Transaction History
    console.log(`\n--- 7. Checking Transaction History (User A) ---`);
    const historyA = await get('/financial/transactions', tokenA);
    console.log('User A Transactions:', historyA.body.data.length);
    historyA.body.data.forEach(tx => console.log(` - ${tx.type}: ${tx.amount} ${tx.currency} (${tx.status})`));

    console.log('\n---------------------------------------------------------');
    console.log('End Verification');
}

runTest().catch(console.error);
