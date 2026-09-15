const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
console.log('Using secret:', secret.substring(0, 3) + '...');

const payload = {
    sub: 'test-user-id',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    type: 'access'
};

const token = jwt.sign(payload, secret);
console.log('Generated token:', token);

try {
    const verified = jwt.verify(token, secret);
    console.log('✅ Local verification successful');
    console.log('Payload:', verified);
} catch (error) {
    console.error('❌ Local verification failed:', error.message);
}

// Test TokenService directly
const TokenService = require('../services/TokenService');
TokenService.verifyToken(token, 'access')
    .then(p => console.log('✅ TokenService verification successful'))
    .catch(e => console.error('❌ TokenService verification failed:', e.message));
