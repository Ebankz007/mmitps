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
const patch = (path, body, token) => request('PATCH', path, body, token);

async function runTest() {
    console.log('🚀 Starting Milestone 9 Verification: Market Analysis & News');
    console.log('---------------------------------------------------------');

    const uniqueId = Date.now().toString().slice(-6);

    // 1. Register Analyst (Admin)
    console.log(`\n--- 1. Registering Analyst (Admin) ---`);
    const adminRes = await post('/auth/register', {
        email: `analyst.${uniqueId}@example.com`,
        password: 'Password123!',
        username: `analyst.${uniqueId}`,
        role: 'admin'
    });
    const adminToken = adminRes.body.data.tokens.access.token;
    console.log('Analyst Token Acquired');

    // 2. Post Market Analysis
    console.log(`\n--- 2. Posting Market Analysis ---`);
    const analysisRes = await post('/analysis', {
        title: 'BTCUSD Technical Analysis',
        pair: 'BTC/USD',
        type: 'technical',
        content: 'Bitcoin is showing a bullish pattern on the daily chart. RSI is in the neutral zone.',
        prediction: {
            direction: 'bullish',
            targetPrice: 65000,
            stopLoss: 58000
        }
    }, adminToken);

    if (analysisRes.status === 201) {
        console.log('✅ Analysis Posted. ID:', analysisRes.body.data._id);
    } else {
        console.log('❌ Analysis Posting Failed:', analysisRes.status, JSON.stringify(analysisRes.body, null, 2));
    }

    // 3. Post News Article
    console.log(`\n--- 3. Posting News Article ---`);
    const newsRes = await post('/news', {
        title: `Federal Reserve Meeting Impact ${uniqueId}`,
        content: 'The Federal Reserve held interest rates steady today, causing a spike in market volatility.',
        category: 'economy',
        summary: 'Fed keeps rates steady.'
    }, adminToken);

    if (newsRes.status === 201) {
        console.log('✅ News Article Created. ID:', newsRes.body.data._id);
    } else {
        console.log('❌ News Article Creation Failed:', newsRes.status, JSON.stringify(newsRes.body, null, 2));
    }
    const newsId = newsRes.body.data._id;
    const newsSlug = newsRes.body.data.slug;

    // 4. Publish News Article
    console.log(`\n--- 4. Publishing News Article ---`);
    const publishRes = await patch(`/news/${newsId}/publish`, {}, adminToken);
    if (publishRes.status === 200) {
        console.log('✅ Article Published');
    } else {
        console.log('❌ Article Publish Failed:', publishRes.status);
    }

    // 5. Retrieve Public Analysis & News
    console.log(`\n--- 5. Retrieving Public Content ---`);
    const publicAnalysis = await get('/analysis');
    console.log('Active Analysis found:', publicAnalysis.body.data.length);

    const publicNews = await get('/news');
    console.log('Published News found:', publicNews.body.data.length);

    console.log('\n---------------------------------------------------------');
    console.log('End Verification');
}

runTest().catch(console.error);
