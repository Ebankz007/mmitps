const UserRepository = require('../repositories/UserRepository');
const TokenService = require('./TokenService');
const ApiError = require('../utils/ApiError');

class AuthService {
    /**
     * Register a new user
     * @param {Object} userBody 
     * @returns {Promise<Object>} { user, tokens }
     */
    async register(userBody) {
        if (await UserRepository.emailExists(userBody.email)) {
            throw ApiError.conflict('Email already taken');
        }

        const { sponsorId, ...rest } = userBody;

        // Create user
        const newUserPayload = { ...rest };
        if (userBody.tierId) {
            newUserPayload.preferences = newUserPayload.preferences || {};
            newUserPayload.preferences.tier = userBody.tierId;
        }

        const user = await UserRepository.create(newUserPayload);

        // Genealogy Placement
        if (sponsorId) {
            const GenealogyService = require('./mlm/GenealogyService');
            try {
                await GenealogyService.placeUser(user._id, sponsorId, 'auto');
            } catch (error) {
                console.error('Failed to place user in genealogy tree:', error);
                // We don't want to fail registration if tree placement fails,
                // though in a production MLM app, this might be a critical failure.
            }
        }

        // Generate tokens
        const tokens = await TokenService.generateAuthTokens(user);

        // Send welcome email
        const EmailService = require('./emailService');
        try {
            await EmailService.sendWelcomeEmail(user);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }

        return { user, tokens };
    }

    /**
     * Login with email and password
     * @param {String} email 
     * @param {String} password 
     * @returns {Promise<Object>} { user, tokens }
     */
    async login(email, password) {
        console.log(`[DEBUG AUTH] Attempting login for email: ${email}`);
        const user = await UserRepository.findByEmailWithPassword(email);

        if (!user) {
            console.log(`[DEBUG AUTH] User not found for email: ${email}`);
            throw ApiError.unauthorized('Incorrect email or password');
        }

        console.log(`[DEBUG AUTH] User found. ID: ${user._id}. Role: ${user.role}. Comparing passwords...`);
        const isMatch = await user.comparePassword(password);
        console.log(`[DEBUG AUTH] Password matching result: ${isMatch}`);

        if (!isMatch) {
            console.log(`[DEBUG AUTH] Password mismatch for user: ${email}`);
            throw ApiError.unauthorized('Incorrect email or password');
        }

        // Sanitize user before returning (remove password)
        const userWithoutPassword = user.toJSON();

        const tokens = await TokenService.generateAuthTokens(user);
        console.log(`[DEBUG AUTH] [${new Date().toISOString()}] Login successful for: ${email}. Tokens generated.`);

        return { user: userWithoutPassword, tokens };
    }

    /**
     * Refresh auth tokens
     * @param {String} refreshToken
     * @returns {Promise<Object>} { access, refresh }
     */
    async refreshAuth(refreshToken) {
        try {
            const payload = await TokenService.verifyToken(refreshToken, 'refresh');
            const user = await UserRepository.findById(payload.sub);

            if (!user) {
                throw new Error();
            }

            return TokenService.generateAuthTokens(user);
        } catch (error) {
            throw ApiError.unauthorized('Please authenticate');
        }
    }

    /**
     * Logout (optional if using blacklisting, otherwise stateless)
     * @param {String} refreshToken 
     */
    async logout(refreshToken) {
        // Implementation for token blacklisting would go here
        // For now, stateless JWT doesn't strictly require server-side logout unless tracking active tokens
        return true;
    }

    async forgotPassword(email) {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Generate token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash and save to user
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

        await user.save({ validateBeforeSave: false });

        // Send email
        const EmailService = require('./emailService');
        // Use origin from env or fallback
        const frontendUrl = process.env.FRONTEND_URL || 'https://app.mmitps.com';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        try {
            await EmailService.sendPasswordReset(user, resetUrl);
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            throw new ApiError(500, 'Email could not be sent');
        }
    }

    async resetPassword(token, newPassword) {
        const crypto = require('crypto');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Need direct mongoose model access for custom query
        const User = require('../models/User');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            throw new ApiError(400, 'Token is invalid or has expired');
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return user;
    }
    /**
     * Send magic link to user
     * @param {string} email 
     */
    async sendMagicLink(email) {
        const token = TokenService.generateMagicLinkToken(email);
        const frontendUrl = process.env.FRONTEND_URL || 'https://app.mmitps.com';
        const magicLink = `${frontendUrl}/login/verify?token=${token}`;

        const EmailService = require('./emailService');
        await EmailService.sendEmail(
            email,
            'Your MMITPS Magic Link',
            `<h3>Login to MMITPS</h3>
             <p>Click the link below to sign in instantly:</p>
             <a href="${magicLink}">${magicLink}</a>
             <p>This link expires in 15 minutes.</p>`
        );
    }

    /**
     * Verify magic link and return user + tokens
     * @param {string} token 
     * @returns {Promise<Object>}
     */
    async verifyMagicLink(token) {
        const email = TokenService.verifyMagicLinkToken(token);
        let user = await UserRepository.findByEmail(email);

        if (!user) {
            // Auto-register user if they don't exist
            user = await UserRepository.create({
                email,
                username: email.split('@')[0],
                password: require('crypto').randomBytes(16).toString('hex'), // Random password for social/magic users
                role: 'user',
                isActive: true
            });
        }

        const tokens = await TokenService.generateAuthTokens(user);
        return { user: user.toJSON(), tokens };
    }

    /**
     * Sync user from social provider
     * @param {Object} profile 
     * @returns {Promise<Object>}
     */
    async syncSocialUser(profile) {
        const { email, firstName, lastName, provider } = profile;
        let user = await UserRepository.findByEmail(email);

        if (!user) {
            user = await UserRepository.create({
                email,
                username: email.split('@')[0],
                firstName,
                lastName,
                password: require('crypto').randomBytes(16).toString('hex'),
                role: 'user',
                isActive: true,
                provider // Track provider
            });
        }

        const tokens = await TokenService.generateAuthTokens(user);
        return { user: user.toJSON(), tokens };
    }
}

module.exports = new AuthService();
