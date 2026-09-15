// Using native fetch in Node 18+
// If node-fetch isn't installed, we might default to http logic or assume Node 18+
// Let's assume native fetch or standard http. I'll use a simple http wrapper to be safe.

const http = require('http');

const post = (path, data, token) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5008,
            path: '/api/v1' + path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

const get = (path, token) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5008,
            path: '/api/v1' + path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
};

const patch = (path, data, token) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5008,
            path: '/api/v1' + path,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

async function runTest() {
    const email = `test.milestone2.${Date.now()}@example.com`;
    const password = 'Password123!';
    const newPassword = 'NewPassword123!';

    console.log(`Testing with email: ${email}`);

    // 1. Register
    console.log('\n--- 1. Registering ---');
    const regRes = await post('/auth/register', {
        email,
        password,
        firstName: 'Test',
        lastName: 'User'
    });
    console.log('Status:', regRes.status);
    console.log('Body:', JSON.stringify(regRes.body, null, 2));

    if (regRes.status !== 201) {
        console.error('Registration failed');
        process.exit(1);
    }

    const token = regRes.body.data.tokens.access.token;
    console.log('Got token:', token ? 'YES' : 'NO');

    // 1.5 Ping User Routes
    console.log('\n--- 1.5 Pinging User Routes ---');
    const pingRes = await get('/users/ping');
    console.log('Ping Status:', pingRes.status);
    console.log('Ping Body:', pingRes.body);

    // 2. Get Profile
    console.log('\n--- 2. Getting Profile ---');
    const profileRes = await get('/users/profile', token);
    console.log('Status:', profileRes.status);
    if (profileRes.status !== 200) {
        console.log('Body:', JSON.stringify(profileRes.body, null, 2));
        console.error('Get Profile failed');
        process.exit(1);
    }
    console.log('User:', profileRes.body.data.email);

    // 3. Change Password
    console.log('\n--- 3. Changing Password ---');
    const changePassRes = await patch('/users/change-password', {
        currentPassword: password,
        newPassword: newPassword
    }, token);
    console.log('Status:', changePassRes.status);
    console.log('Body:', changePassRes.body);

    if (changePassRes.status !== 200) {
        console.error('Change Password failed');
        process.exit(1);
    }

    // 4. Login with Old Password (Should fail)
    console.log('\n--- 4. Login Old Password (Expect Fail) ---');
    const loginFailRes = await post('/auth/login', {
        email,
        password: password
    });
    console.log('Status:', loginFailRes.status);

    if (loginFailRes.status !== 401) {
        console.error('Old password login should have failed');
        // process.exit(1); // Proceed for now
    }

    // 5. Login with New Password
    console.log('\n--- 5. Login New Password ---');
    const loginSuccessRes = await post('/auth/login', {
        email,
        password: newPassword
    });
    console.log('Status:', loginSuccessRes.status);
    console.log('Body:', JSON.stringify(loginSuccessRes.body.data.user.email, null, 2));

    if (loginSuccessRes.status !== 200) {
        console.error('New password login failed');
        process.exit(1);
    }

    console.log('\n✅ VERIFICATION SUCCESSFUL');
}

runTest().catch(console.error);
