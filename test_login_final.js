const axios = require('axios');

async function test() {
    try {
        console.log('Testing login for trader@mmitps.com...');
        const res = await axios.post('http://localhost:5066/api/v1/auth/login', {
            email: 'trader@mmitps.com',
            password: 'Trader@123'
        });
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('Failed:', err.response ? err.response.status : 'No Response');
        console.error('Error Data:', err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    }
}

test();
