const axios = require('axios');

async function testLogin() {
    try {
        console.log('--- Testing Login API ---');
        const response = await axios.post('http://localhost:5050/api/v1/auth/login', {
            email: 'trader@mmitps.com',
            password: 'Trader@123'
        });
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error Status:', error.response?.status);
        console.error('Error Data:', error.response?.data);
        if (!error.response) {
            console.error('Connect Error:', error.message);
        }
    }
}

testLogin();
