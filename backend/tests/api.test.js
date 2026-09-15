const axios = require('axios');

const API_URL = 'http://localhost:5008/api/v1';

describe('Basic API Integrity', () => {
    test('GET /health should return 200', async () => {
        try {
            const response = await axios.get(`${API_URL}/health`);
            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
        } catch (error) {
            // Fail test if connection refused (server down)
            throw new Error(`Server is not running on 5008 or health check failed: ${error.message}`);
        }
    });

    test('POST /auth/login should fail with invalid credentials', async () => {
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email: 'wrong@example.com',
                password: 'wrongpassword'
            });
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    });

    test('POST /auth/login should succeed with default superadmin', async () => {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'superadmin@mmitps.com',
            password: 'Admin@123'
        });
        expect(response.status).toBe(200);
        expect(response.data.data.tokens).toBeDefined();
    });
});
