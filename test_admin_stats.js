const axios = require('axios');

async function test() {
    try {
        console.log('Testing Admin Stats endpoint on port 5066...');
        // We need an admin token for this to work, but even without one, 
        // if the route exists we should get a 401 (Unauthorized) not a 404.
        const res = await axios.get('http://localhost:5066/api/v1/admin/subscriptions/stats');
        console.log('Status:', res.status);
    } catch (err) {
        console.log('Status:', err.response ? err.response.status : 'No Response');
        if (err.response && err.response.data) {
            console.log('Error Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.log('Error Message:', err.message);
        }
    }
}

test();
