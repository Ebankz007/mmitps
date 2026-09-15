const axios = require('axios');

const API_URL = 'http://localhost:5077/api/v1';

async function verify() {
    console.log('--- STARTING VERIFICATION ---');
    
    try {
        // 1. Login as Super Admin
        console.log('Logging in as Super Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'superadmin@mmitps.com',
            password: 'Mmitps@2026'
        });
        const token = loginRes.data.data.tokens.access.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('Login successful.');

        // 2. Create a new Staff account
        const randomStr = Math.random().toString(36).substring(7);
        const staffEmail = `staff_${randomStr}@test.com`;
        console.log(`Creating new staff account: ${staffEmail}...`);
        const createRes = await axios.post(`${API_URL}/admin/users`, {
            email: staffEmail,
            password: 'StaffPassword@123',
            role: 'manager',
            firstName: 'Test',
            lastName: 'Staff'
        }, config);
        const newUserId = createRes.data.data._id;
        console.log(`Staff created. ID: ${newUserId}`);

        // 3. Update the role of the new staff
        console.log(`Updating role of ${staffEmail} to 'support'...`);
        const updateRes = await axios.patch(`${API_URL}/admin/users/${newUserId}/role`, {
            role: 'support'
        }, config);
        console.log(`Role updated. New role: ${updateRes.data.data.role}`);

        // 4. Verify in System Logs
        console.log('Fetching system logs for verification...');
        const logsRes = await axios.get(`${API_URL}/admin/logs`, config);
        const lastLog = logsRes.data.data[0];
        console.log(`Last Activity Log: [${lastLog.action}] ${lastLog.description}`);

        if (lastLog.action === 'update_user_role') {
            console.log('✅ VERIFICATION SUCCESSFUL');
        } else {
            console.log('❌ VERIFICATION FAILED: Log mismatch');
        }

    } catch (error) {
        console.error('❌ VERIFICATION ERROR:', error.response?.data || error.message);
    }
}

verify();
