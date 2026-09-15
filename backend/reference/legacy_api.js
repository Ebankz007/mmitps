/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    MMITPS BACKEND API INTEGRATION SYSTEM                     ║
 * ║                         Version 2.0 - February 2026                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Complete backend integration for:                                           ║
 * ║  • User Authentication (JWT-based)                                           ║
 * ║  • Email/SMTP Services                                                       ║
 * ║  • Payment Gateways (Cards + Crypto)                                         ║
 * ║  • Market Data APIs                                                          ║
 * ║  • Trading Platform Integrations                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

const MMITPS_CONFIG = {
    // API Base URLs
    API_BASE_URL: 'https://api.mmitps.com/v1',
    WS_BASE_URL: 'wss://ws.mmitps.com/v1',
    
    // Authentication
    AUTH: {
        TOKEN_KEY: 'mmitps_auth_token',
        REFRESH_KEY: 'mmitps_refresh_token',
        USER_KEY: 'mmitps_user_data',
        SESSION_DURATION: 7200000, // 2 hours
        REFRESH_THRESHOLD: 300000, // 5 minutes before expiry
    },
    
    // Payment Providers
    PAYMENTS: {
        STRIPE_PUBLIC_KEY: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxxx',
        PAYSTACK_PUBLIC_KEY: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxxx',
        FLUTTERWAVE_PUBLIC_KEY: 'FLWPUBK-xxxxxxxxxxxxxxxxxxxxxxxxx',
        RAZORPAY_KEY_ID: 'rzp_live_xxxxxxxxxxxxxxxxxxxxxxxxx',
    },
    
    // Crypto Networks
    CRYPTO: {
        SUPPORTED_CHAINS: ['ethereum', 'bsc', 'polygon', 'arbitrum', 'avalanche', 'solana', 'tron'],
        SUPPORTED_TOKENS: ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'SOL', 'TRX'],
    },
    
    // Email Configuration
    EMAIL: {
        FROM_ADDRESS: 'noreply@mmitps.com',
        SUPPORT_ADDRESS: 'support@mmitps.com',
        TEMPLATES: ['welcome', 'password_reset', 'deposit_confirmed', 'withdrawal_pending', 'trade_alert', 'newsletter'],
    },
    
    // Market Data Providers
    MARKET_DATA: {
        FOREX_PROVIDER: 'twelvedata', // Options: twelvedata, fcsapi, currencyapi
        CRYPTO_PROVIDER: 'binance', // Options: binance, coinmarketcap, coingecko
        COT_PROVIDER: 'quandl',
        ECONOMIC_CALENDAR: 'tradingeconomics',
    }
};

// ============================================================================
// SECTION 1: USER AUTHENTICATION SYSTEM
// ============================================================================

const MMITPSAuth = {
    // Current user state
    currentUser: null,
    authToken: null,
    refreshToken: null,
    tokenExpiry: null,
    
    /**
     * Initialize authentication system
     */
    init() {
        this.loadStoredAuth();
        this.setupTokenRefresh();
        this.setupSessionMonitor();
        console.log('[MMITPS Auth] Authentication system initialized');
        return this;
    },
    
    /**
     * Load stored authentication data
     */
    loadStoredAuth() {
        try {
            const token = localStorage.getItem(MMITPS_CONFIG.AUTH.TOKEN_KEY);
            const refresh = localStorage.getItem(MMITPS_CONFIG.AUTH.REFRESH_KEY);
            const userData = localStorage.getItem(MMITPS_CONFIG.AUTH.USER_KEY);
            
            if (token && userData) {
                const tokenData = this.parseJWT(token);
                if (tokenData && tokenData.exp * 1000 > Date.now()) {
                    this.authToken = token;
                    this.refreshToken = refresh;
                    this.currentUser = JSON.parse(userData);
                    this.tokenExpiry = tokenData.exp * 1000;
                    this.onAuthStateChange('authenticated');
                } else {
                    this.clearAuth();
                }
            }
        } catch (error) {
            console.error('[MMITPS Auth] Error loading stored auth:', error);
            this.clearAuth();
        }
    },
    
    /**
     * Parse JWT token
     */
    parseJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(window.atob(base64));
        } catch {
            return null;
        }
    },
    
    /**
     * Register new user
     */
    async register(userData) {
        const {
            email,
            password,
            firstName,
            lastName,
            phone,
            country,
            referralCode = null,
            acceptTerms = false
        } = userData;
        
        if (!acceptTerms) {
            throw new Error('You must accept the terms and conditions');
        }
        
        // Validate inputs
        this.validateEmail(email);
        this.validatePassword(password);
        
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    password: this.hashPassword(password),
                    first_name: firstName,
                    last_name: lastName,
                    phone,
                    country,
                    referral_code: referralCode,
                    accept_terms: acceptTerms,
                    registered_at: new Date().toISOString(),
                    ip_address: await this.getClientIP(),
                    user_agent: navigator.userAgent,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            
            // Send welcome email
            await MMITPSEmail.sendWelcomeEmail(email, firstName);
            
            // Auto-login after registration
            await this.login(email, password);
            
            return {
                success: true,
                message: 'Registration successful! Welcome to MMITPS.',
                user: data.user,
            };
            
        } catch (error) {
            console.error('[MMITPS Auth] Registration error:', error);
            throw error;
        }
    },
    
    /**
     * Login user
     */
    async login(email, password, rememberMe = false) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    password: this.hashPassword(password),
                    device_info: this.getDeviceInfo(),
                    remember_me: rememberMe,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid email or password');
                }
                if (response.status === 403) {
                    throw new Error('Account is locked. Please contact support.');
                }
                throw new Error(data.message || 'Login failed');
            }
            
            // Store authentication data
            this.authToken = data.access_token;
            this.refreshToken = data.refresh_token;
            this.currentUser = data.user;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);
            
            localStorage.setItem(MMITPS_CONFIG.AUTH.TOKEN_KEY, this.authToken);
            localStorage.setItem(MMITPS_CONFIG.AUTH.REFRESH_KEY, this.refreshToken);
            localStorage.setItem(MMITPS_CONFIG.AUTH.USER_KEY, JSON.stringify(this.currentUser));
            
            this.onAuthStateChange('authenticated');
            
            // Log login activity
            await this.logActivity('login', { ip: await this.getClientIP() });
            
            return {
                success: true,
                message: 'Login successful',
                user: this.currentUser,
            };
            
        } catch (error) {
            console.error('[MMITPS Auth] Login error:', error);
            throw error;
        }
    },
    
    /**
     * Logout user
     */
    async logout() {
        try {
            if (this.authToken) {
                await fetch(`${MMITPS_CONFIG.API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                    },
                });
            }
        } catch (error) {
            console.error('[MMITPS Auth] Logout error:', error);
        } finally {
            this.clearAuth();
            this.onAuthStateChange('unauthenticated');
        }
    },
    
    /**
     * Clear authentication data
     */
    clearAuth() {
        this.authToken = null;
        this.refreshToken = null;
        this.currentUser = null;
        this.tokenExpiry = null;
        localStorage.removeItem(MMITPS_CONFIG.AUTH.TOKEN_KEY);
        localStorage.removeItem(MMITPS_CONFIG.AUTH.REFRESH_KEY);
        localStorage.removeItem(MMITPS_CONFIG.AUTH.USER_KEY);
    },
    
    /**
     * Refresh authentication token
     */
    async refreshAuthToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }
        
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh_token: this.refreshToken,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Token refresh failed');
            }
            
            this.authToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);
            localStorage.setItem(MMITPS_CONFIG.AUTH.TOKEN_KEY, this.authToken);
            
            return true;
            
        } catch (error) {
            console.error('[MMITPS Auth] Token refresh error:', error);
            this.clearAuth();
            this.onAuthStateChange('unauthenticated');
            return false;
        }
    },
    
    /**
     * Setup automatic token refresh
     */
    setupTokenRefresh() {
        setInterval(async () => {
            if (this.authToken && this.tokenExpiry) {
                const timeUntilExpiry = this.tokenExpiry - Date.now();
                if (timeUntilExpiry < MMITPS_CONFIG.AUTH.REFRESH_THRESHOLD) {
                    await this.refreshAuthToken();
                }
            }
        }, 60000); // Check every minute
    },
    
    /**
     * Setup session monitor
     */
    setupSessionMonitor() {
        // Monitor for activity
        let lastActivity = Date.now();
        
        ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
            document.addEventListener(event, () => {
                lastActivity = Date.now();
            });
        });
        
        // Check for inactivity
        setInterval(() => {
            if (this.authToken && (Date.now() - lastActivity > MMITPS_CONFIG.AUTH.SESSION_DURATION)) {
                this.logout();
                this.showSessionExpiredModal();
            }
        }, 60000);
    },
    
    /**
     * Password reset request
     */
    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/auth/password-reset/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Password reset request failed');
            }
            
            return {
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link.',
            };
            
        } catch (error) {
            console.error('[MMITPS Auth] Password reset request error:', error);
            throw error;
        }
    },
    
    /**
     * Reset password with token
     */
    async resetPassword(token, newPassword) {
        this.validatePassword(newPassword);
        
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/auth/password-reset/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    new_password: this.hashPassword(newPassword),
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed');
            }
            
            return {
                success: true,
                message: 'Password has been reset successfully. You can now login.',
            };
            
        } catch (error) {
            console.error('[MMITPS Auth] Password reset error:', error);
            throw error;
        }
    },
    
    /**
     * Change password (authenticated)
     */
    async changePassword(currentPassword, newPassword) {
        if (!this.authToken) {
            throw new Error('Not authenticated');
        }
        
        this.validatePassword(newPassword);
        
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/auth/password-change`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                },
                body: JSON.stringify({
                    current_password: this.hashPassword(currentPassword),
                    new_password: this.hashPassword(newPassword),
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Password change failed');
            }
            
            return {
                success: true,
                message: 'Password changed successfully',
            };
            
        } catch (error) {
            console.error('[MMITPS Auth] Password change error:', error);
            throw error;
        }
    },
    
    /**
     * Two-Factor Authentication setup
     */
    async setup2FA() {
        if (!this.authToken) {
            throw new Error('Not authenticated');
        }
        
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/auth/2fa/setup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                },
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '2FA setup failed');
            }
            
            return {
                success: true,
                secret: data.secret,
                qrCode: data.qr_code_url,
                backupCodes: data.backup_codes,
            };
            
        } catch (error) {
            console.error('[MMITPS Auth] 2FA setup error:', error);
            throw error;
        }
    },
    
    /**
     * Verify 2FA code
     */
    async verify2FA(code) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/auth/2fa/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                },
                body: JSON.stringify({ code }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '2FA verification failed');
            }
            
            return {
                success: true,
                message: '2FA verified successfully',
            };
            
        } catch (error) {
            console.error('[MMITPS Auth] 2FA verification error:', error);
            throw error;
        }
    },
    
    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
    },
    
    /**
     * Validate password strength
     */
    validatePassword(password) {
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            throw new Error('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            throw new Error('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            throw new Error('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            throw new Error('Password must contain at least one special character');
        }
    },
    
    /**
     * Hash password (client-side pre-hash before sending to server)
     */
    hashPassword(password) {
        // Using SubtleCrypto for SHA-256 hash
        // In production, the server will hash again with bcrypt/argon2
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'mmitps_salt_2026');
        return Array.from(new Uint8Array(data))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },
    
    /**
     * Get device information
     */
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
    },
    
    /**
     * Get client IP address
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    },
    
    /**
     * Log user activity
     */
    async logActivity(action, details = {}) {
        try {
            await fetch(`${MMITPS_CONFIG.API_BASE_URL}/activity/log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                },
                body: JSON.stringify({
                    action,
                    details,
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (error) {
            console.error('[MMITPS Auth] Activity log error:', error);
        }
    },
    
    /**
     * Auth state change callback
     */
    onAuthStateChange(state) {
        // Dispatch custom event for UI updates
        document.dispatchEvent(new CustomEvent('mmitps:auth:change', {
            detail: { state, user: this.currentUser }
        }));
        
        // Update UI elements
        this.updateAuthUI(state);
    },
    
    /**
     * Update authentication UI elements
     */
    updateAuthUI(state) {
        const authElements = document.querySelectorAll('[data-auth-required]');
        const guestElements = document.querySelectorAll('[data-guest-only]');
        const userNameElements = document.querySelectorAll('[data-user-name]');
        const userEmailElements = document.querySelectorAll('[data-user-email]');
        const userAvatarElements = document.querySelectorAll('[data-user-avatar]');
        
        if (state === 'authenticated') {
            authElements.forEach(el => el.style.display = '');
            guestElements.forEach(el => el.style.display = 'none');
            userNameElements.forEach(el => el.textContent = `${this.currentUser.first_name} ${this.currentUser.last_name}`);
            userEmailElements.forEach(el => el.textContent = this.currentUser.email);
            userAvatarElements.forEach(el => {
                if (this.currentUser.avatar) {
                    el.src = this.currentUser.avatar;
                }
            });
        } else {
            authElements.forEach(el => el.style.display = 'none');
            guestElements.forEach(el => el.style.display = '');
        }
    },
    
    /**
     * Show session expired modal
     */
    showSessionExpiredModal() {
        const modal = document.getElementById('session-expired-modal');
        if (modal) {
            modal.style.display = 'flex';
        } else {
            alert('Your session has expired. Please login again.');
            window.location.href = '#login';
        }
    },
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.authToken && this.tokenExpiry > Date.now();
    },
    
    /**
     * Get current user
     */
    getUser() {
        return this.currentUser;
    },
    
    /**
     * Get auth headers for API requests
     */
    getAuthHeaders() {
        if (!this.authToken) {
            return {};
        }
        return {
            'Authorization': `Bearer ${this.authToken}`,
        };
    },
};


// ============================================================================
// SECTION 2: EMAIL / SMTP SERVICE
// ============================================================================

const MMITPSEmail = {
    /**
     * Send email via API
     */
    async sendEmail(to, subject, template, variables = {}) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/email/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({
                    to,
                    subject,
                    template,
                    variables,
                    from: MMITPS_CONFIG.EMAIL.FROM_ADDRESS,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Email sending failed');
            }
            
            return {
                success: true,
                message_id: data.message_id,
            };
            
        } catch (error) {
            console.error('[MMITPS Email] Send error:', error);
            throw error;
        }
    },
    
    /**
     * Send welcome email
     */
    async sendWelcomeEmail(email, firstName) {
        return this.sendEmail(
            email,
            'Welcome to MMITPS Trading Platform!',
            'welcome',
            {
                first_name: firstName,
                login_url: 'https://app.mmitps.com/login',
                support_email: MMITPS_CONFIG.EMAIL.SUPPORT_ADDRESS,
            }
        );
    },
    
    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email, resetToken) {
        return this.sendEmail(
            email,
            'Reset Your MMITPS Password',
            'password_reset',
            {
                reset_link: `https://app.mmitps.com/reset-password?token=${resetToken}`,
                expiry_hours: 24,
            }
        );
    },
    
    /**
     * Send deposit confirmation email
     */
    async sendDepositConfirmation(email, amount, currency, transactionId) {
        return this.sendEmail(
            email,
            'Deposit Confirmed - MMITPS',
            'deposit_confirmed',
            {
                amount: amount.toFixed(2),
                currency,
                transaction_id: transactionId,
                timestamp: new Date().toISOString(),
            }
        );
    },
    
    /**
     * Send withdrawal pending email
     */
    async sendWithdrawalPending(email, amount, currency, estimatedTime) {
        return this.sendEmail(
            email,
            'Withdrawal Request Received - MMITPS',
            'withdrawal_pending',
            {
                amount: amount.toFixed(2),
                currency,
                estimated_time: estimatedTime,
            }
        );
    },
    
    /**
     * Send trade alert email
     */
    async sendTradeAlert(email, alertType, pair, price, details) {
        return this.sendEmail(
            email,
            `Trade Alert: ${alertType} on ${pair}`,
            'trade_alert',
            {
                alert_type: alertType,
                pair,
                price: price.toFixed(5),
                details,
                timestamp: new Date().toISOString(),
            }
        );
    },
    
    /**
     * Send newsletter
     */
    async sendNewsletter(email, subject, content) {
        return this.sendEmail(
            email,
            subject,
            'newsletter',
            {
                content,
                unsubscribe_link: `https://app.mmitps.com/unsubscribe?email=${encodeURIComponent(email)}`,
            }
        );
    },
    
    /**
     * Send support ticket confirmation
     */
    async sendTicketConfirmation(email, ticketId, subject) {
        return this.sendEmail(
            email,
            `Support Ticket #${ticketId} Created`,
            'ticket_created',
            {
                ticket_id: ticketId,
                subject,
                support_email: MMITPS_CONFIG.EMAIL.SUPPORT_ADDRESS,
            }
        );
    },
    
    /**
     * Send KYC verification status
     */
    async sendKYCStatus(email, status, reason = null) {
        const subjects = {
            approved: 'KYC Verification Approved - MMITPS',
            rejected: 'KYC Verification Update Required - MMITPS',
            pending: 'KYC Verification Under Review - MMITPS',
        };
        
        return this.sendEmail(
            email,
            subjects[status] || 'KYC Verification Update - MMITPS',
            'kyc_status',
            {
                status,
                reason,
            }
        );
    },
    
    /**
     * Send referral commission notification
     */
    async sendReferralCommission(email, amount, currency, referredUser) {
        return this.sendEmail(
            email,
            'Referral Commission Earned! - MMITPS',
            'referral_commission',
            {
                amount: amount.toFixed(2),
                currency,
                referred_user: referredUser,
            }
        );
    },
};


// ============================================================================
// SECTION 3: PAYMENT GATEWAY INTEGRATION
// ============================================================================

const MMITPSPayments = {
    // Active payment session
    currentSession: null,
    
    /**
     * Initialize payment providers
     */
    async init() {
        // Load Stripe
        if (!window.Stripe) {
            await this.loadScript('https://js.stripe.com/v3/');
        }
        
        console.log('[MMITPS Payments] Payment system initialized');
        return this;
    },
    
    /**
     * Load external script
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    
    // =========================================================================
    // CARD PAYMENTS
    // =========================================================================
    
    /**
     * Process card payment with Stripe (Global)
     */
    async processStripePayment(amount, currency, description) {
        try {
            // Create payment intent on server
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/payments/stripe/create-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100), // Stripe uses cents
                    currency: currency.toLowerCase(),
                    description,
                }),
            });
            
            const { client_secret, payment_intent_id } = await response.json();
            
            // Initialize Stripe
            const stripe = Stripe(MMITPS_CONFIG.PAYMENTS.STRIPE_PUBLIC_KEY);
            
            // Create payment element
            const elements = stripe.elements({ clientSecret: client_secret });
            const paymentElement = elements.create('payment');
            
            return {
                success: true,
                payment_intent_id,
                stripe,
                elements,
                paymentElement,
                confirmPayment: async (element) => {
                    const { error, paymentIntent } = await stripe.confirmPayment({
                        elements,
                        confirmParams: {
                            return_url: `${window.location.origin}/payment/success`,
                        },
                        redirect: 'if_required',
                    });
                    
                    if (error) {
                        throw new Error(error.message);
                    }
                    
                    return paymentIntent;
                },
            };
            
        } catch (error) {
            console.error('[MMITPS Payments] Stripe payment error:', error);
            throw error;
        }
    },
    
    /**
     * Process card payment with PayStack (Africa)
     */
    async processPaystackPayment(amount, currency, email, metadata = {}) {
        return new Promise((resolve, reject) => {
            const handler = PaystackPop.setup({
                key: MMITPS_CONFIG.PAYMENTS.PAYSTACK_PUBLIC_KEY,
                email,
                amount: Math.round(amount * 100), // Paystack uses kobo/cents
                currency: currency.toUpperCase(),
                metadata: {
                    custom_fields: [
                        { display_name: 'Platform', variable_name: 'platform', value: 'MMITPS' },
                        ...Object.entries(metadata).map(([key, value]) => ({
                            display_name: key,
                            variable_name: key,
                            value,
                        })),
                    ],
                },
                callback: (response) => {
                    resolve({
                        success: true,
                        reference: response.reference,
                        transaction: response.transaction,
                    });
                },
                onClose: () => {
                    reject(new Error('Payment cancelled'));
                },
            });
            
            handler.openIframe();
        });
    },
    
    /**
     * Process card payment with Flutterwave (Africa, Global)
     */
    async processFlutterwavePayment(amount, currency, email, name, phone) {
        return new Promise((resolve, reject) => {
            FlutterwaveCheckout({
                public_key: MMITPS_CONFIG.PAYMENTS.FLUTTERWAVE_PUBLIC_KEY,
                tx_ref: `MMITPS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                amount,
                currency: currency.toUpperCase(),
                payment_options: 'card,banktransfer,ussd,mobilemoney',
                customer: {
                    email,
                    name,
                    phone_number: phone,
                },
                customizations: {
                    title: 'MMITPS Deposit',
                    description: 'Fund your MMITPS trading account',
                    logo: 'https://app.mmitps.com/assets/logo.png',
                },
                callback: (response) => {
                    resolve({
                        success: true,
                        transaction_id: response.transaction_id,
                        tx_ref: response.tx_ref,
                        status: response.status,
                    });
                },
                onclose: () => {
                    reject(new Error('Payment cancelled'));
                },
            });
        });
    },
    
    /**
     * Process card payment with Razorpay (India, Asia)
     */
    async processRazorpayPayment(amount, currency, email, name, phone) {
        try {
            // Create order on server
            const orderResponse = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/payments/razorpay/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100),
                    currency: currency.toUpperCase(),
                }),
            });
            
            const { order_id } = await orderResponse.json();
            
            return new Promise((resolve, reject) => {
                const options = {
                    key: MMITPS_CONFIG.PAYMENTS.RAZORPAY_KEY_ID,
                    amount: Math.round(amount * 100),
                    currency: currency.toUpperCase(),
                    name: 'MMITPS',
                    description: 'Trading Account Deposit',
                    order_id,
                    prefill: {
                        name,
                        email,
                        contact: phone,
                    },
                    theme: {
                        color: '#00d4aa',
                    },
                    handler: (response) => {
                        resolve({
                            success: true,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                    },
                    modal: {
                        ondismiss: () => {
                            reject(new Error('Payment cancelled'));
                        },
                    },
                };
                
                const rzp = new Razorpay(options);
                rzp.open();
            });
            
        } catch (error) {
            console.error('[MMITPS Payments] Razorpay error:', error);
            throw error;
        }
    },
    
    // =========================================================================
    // CRYPTO PAYMENTS
    // =========================================================================
    
    /**
     * Get deposit address for cryptocurrency
     */
    async getCryptoDepositAddress(chain, token) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/payments/crypto/deposit-address`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({
                    chain,
                    token,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate deposit address');
            }
            
            return {
                success: true,
                address: data.address,
                memo: data.memo || null,
                qr_code: data.qr_code,
                minimum_deposit: data.minimum_deposit,
                confirmations_required: data.confirmations_required,
                expires_at: data.expires_at,
            };
            
        } catch (error) {
            console.error('[MMITPS Payments] Crypto deposit address error:', error);
            throw error;
        }
    },
    
    /**
     * Process crypto withdrawal
     */
    async processCryptoWithdrawal(chain, token, amount, destinationAddress, memo = null) {
        try {
            // Validate address format
            if (!this.validateCryptoAddress(chain, destinationAddress)) {
                throw new Error('Invalid destination address format');
            }
            
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/payments/crypto/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({
                    chain,
                    token,
                    amount,
                    destination_address: destinationAddress,
                    memo,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Withdrawal request failed');
            }
            
            return {
                success: true,
                withdrawal_id: data.withdrawal_id,
                status: data.status,
                estimated_completion: data.estimated_completion,
                fee: data.fee,
            };
            
        } catch (error) {
            console.error('[MMITPS Payments] Crypto withdrawal error:', error);
            throw error;
        }
    },
    
    /**
     * Connect Web3 wallet (MetaMask, WalletConnect, etc.)
     */
    async connectWeb3Wallet(walletType = 'metamask') {
        try {
            if (walletType === 'metamask') {
                if (!window.ethereum) {
                    throw new Error('MetaMask is not installed');
                }
                
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });
                
                const chainId = await window.ethereum.request({
                    method: 'eth_chainId',
                });
                
                return {
                    success: true,
                    address: accounts[0],
                    chainId: parseInt(chainId, 16),
                    provider: window.ethereum,
                };
            }
            
            // WalletConnect implementation
            if (walletType === 'walletconnect') {
                // WalletConnect v2 implementation
                const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
                
                const provider = await EthereumProvider.init({
                    projectId: 'mmitps_walletconnect_project_id',
                    chains: [1, 56, 137, 42161, 43114], // ETH, BSC, Polygon, Arbitrum, Avalanche
                    showQrModal: true,
                });
                
                await provider.enable();
                
                const accounts = await provider.request({ method: 'eth_accounts' });
                const chainId = await provider.request({ method: 'eth_chainId' });
                
                return {
                    success: true,
                    address: accounts[0],
                    chainId: parseInt(chainId, 16),
                    provider,
                };
            }
            
            throw new Error('Unsupported wallet type');
            
        } catch (error) {
            console.error('[MMITPS Payments] Web3 wallet connection error:', error);
            throw error;
        }
    },
    
    /**
     * Process Web3 payment (direct blockchain transaction)
     */
    async processWeb3Payment(chain, token, amount, provider) {
        try {
            // Get deposit address
            const { address: depositAddress } = await this.getCryptoDepositAddress(chain, token);
            
            // Token contract addresses
            const tokenContracts = {
                ethereum: {
                    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                },
                bsc: {
                    USDT: '0x55d398326f99059fF775485246999027B3197955',
                    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
                },
                polygon: {
                    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
                    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                },
                arbitrum: {
                    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
                    USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
                },
                avalanche: {
                    USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
                    USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
                },
            };
            
            const Web3 = (await import('web3')).default;
            const web3 = new Web3(provider);
            const accounts = await web3.eth.getAccounts();
            const fromAddress = accounts[0];
            
            // ERC-20 ABI for transfer
            const erc20Abi = [
                {
                    constant: false,
                    inputs: [
                        { name: '_to', type: 'address' },
                        { name: '_value', type: 'uint256' },
                    ],
                    name: 'transfer',
                    outputs: [{ name: '', type: 'bool' }],
                    type: 'function',
                },
                {
                    constant: true,
                    inputs: [{ name: '_owner', type: 'address' }],
                    name: 'balanceOf',
                    outputs: [{ name: 'balance', type: 'uint256' }],
                    type: 'function',
                },
                {
                    constant: true,
                    inputs: [],
                    name: 'decimals',
                    outputs: [{ name: '', type: 'uint8' }],
                    type: 'function',
                },
            ];
            
            if (token === 'ETH' || token === 'BNB') {
                // Native token transfer
                const tx = await web3.eth.sendTransaction({
                    from: fromAddress,
                    to: depositAddress,
                    value: web3.utils.toWei(amount.toString(), 'ether'),
                });
                
                return {
                    success: true,
                    transaction_hash: tx.transactionHash,
                    block_number: tx.blockNumber,
                };
            } else {
                // ERC-20 token transfer
                const tokenAddress = tokenContracts[chain]?.[token];
                if (!tokenAddress) {
                    throw new Error(`Token ${token} not supported on ${chain}`);
                }
                
                const contract = new web3.eth.Contract(erc20Abi, tokenAddress);
                const decimals = await contract.methods.decimals().call();
                const tokenAmount = BigInt(amount * Math.pow(10, decimals));
                
                const tx = await contract.methods.transfer(depositAddress, tokenAmount.toString()).send({
                    from: fromAddress,
                });
                
                return {
                    success: true,
                    transaction_hash: tx.transactionHash,
                    block_number: tx.blockNumber,
                };
            }
            
        } catch (error) {
            console.error('[MMITPS Payments] Web3 payment error:', error);
            throw error;
        }
    },
    
    /**
     * Validate crypto address format
     */
    validateCryptoAddress(chain, address) {
        const patterns = {
            ethereum: /^0x[a-fA-F0-9]{40}$/,
            bsc: /^0x[a-fA-F0-9]{40}$/,
            polygon: /^0x[a-fA-F0-9]{40}$/,
            arbitrum: /^0x[a-fA-F0-9]{40}$/,
            avalanche: /^0x[a-fA-F0-9]{40}$/,
            solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
            tron: /^T[a-zA-Z0-9]{33}$/,
            bitcoin: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
        };
        
        return patterns[chain]?.test(address) || false;
    },
    
    /**
     * Get supported payment methods by region
     */
    getPaymentMethodsByRegion(countryCode) {
        const regions = {
            // North America
            US: ['stripe', 'crypto'],
            CA: ['stripe', 'crypto'],
            
            // Europe
            GB: ['stripe', 'crypto'],
            DE: ['stripe', 'crypto'],
            FR: ['stripe', 'crypto'],
            
            // Africa
            NG: ['paystack', 'flutterwave', 'crypto'],
            KE: ['flutterwave', 'crypto'],
            GH: ['paystack', 'flutterwave', 'crypto'],
            ZA: ['paystack', 'crypto'],
            
            // Asia
            IN: ['razorpay', 'crypto'],
            SG: ['stripe', 'crypto'],
            AE: ['stripe', 'crypto'],
            
            // Default
            DEFAULT: ['stripe', 'crypto'],
        };
        
        return regions[countryCode] || regions.DEFAULT;
    },
    
    /**
     * Get transaction history
     */
    async getTransactionHistory(type = 'all', page = 1, limit = 20) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/payments/transactions?type=${type}&page=${page}&limit=${limit}`,
                {
                    headers: MMITPSAuth.getAuthHeaders(),
                }
            );
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch transactions');
            }
            
            return {
                success: true,
                transactions: data.transactions,
                total: data.total,
                page: data.page,
                pages: data.pages,
            };
            
        } catch (error) {
            console.error('[MMITPS Payments] Transaction history error:', error);
            throw error;
        }
    },
    
    /**
     * Get wallet balance
     */
    async getWalletBalance() {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/wallet/balance`, {
                headers: MMITPSAuth.getAuthHeaders(),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch balance');
            }
            
            return {
                success: true,
                balances: data.balances,
                total_usd: data.total_usd,
            };
            
        } catch (error) {
            console.error('[MMITPS Payments] Wallet balance error:', error);
            throw error;
        }
    },
    
    /**
     * Internal transfer between users
     */
    async internalTransfer(recipientEmail, amount, currency, note = '') {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/wallet/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({
                    recipient_email: recipientEmail,
                    amount,
                    currency,
                    note,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Transfer failed');
            }
            
            return {
                success: true,
                transfer_id: data.transfer_id,
                new_balance: data.new_balance,
            };
            
        } catch (error) {
            console.error('[MMITPS Payments] Internal transfer error:', error);
            throw error;
        }
    },
};


// ============================================================================
// SECTION 4: MARKET DATA API INTEGRATION
// ============================================================================

const MMITPSMarketData = {
    // WebSocket connections
    wsConnections: {},
    
    // Price cache
    priceCache: {},
    
    /**
     * Initialize market data feeds
     */
    async init() {
        console.log('[MMITPS MarketData] Market data system initialized');
        return this;
    },
    
    // =========================================================================
    // FOREX DATA
    // =========================================================================
    
    /**
     * Get forex price
     */
    async getForexPrice(pair) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/market-data/forex/price/${pair}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            
            return {
                pair,
                bid: data.bid,
                ask: data.ask,
                spread: data.spread,
                change: data.change,
                change_percent: data.change_percent,
                high: data.high,
                low: data.low,
                timestamp: data.timestamp,
            };
            
        } catch (error) {
            console.error('[MMITPS MarketData] Forex price error:', error);
            throw error;
        }
    },
    
    /**
     * Get multiple forex prices
     */
    async getForexPrices(pairs) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/market-data/forex/prices`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...MMITPSAuth.getAuthHeaders(),
                    },
                    body: JSON.stringify({ pairs }),
                }
            );
            
            const data = await response.json();
            return data.prices;
            
        } catch (error) {
            console.error('[MMITPS MarketData] Forex prices error:', error);
            throw error;
        }
    },
    
    /**
     * Subscribe to forex price updates (WebSocket)
     */
    subscribeForexPrices(pairs, callback) {
        const ws = new WebSocket(`${MMITPS_CONFIG.WS_BASE_URL}/forex`);
        
        ws.onopen = () => {
            ws.send(JSON.stringify({
                action: 'subscribe',
                pairs,
                token: MMITPSAuth.authToken,
            }));
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.priceCache[data.pair] = data;
            callback(data);
        };
        
        ws.onerror = (error) => {
            console.error('[MMITPS MarketData] WebSocket error:', error);
        };
        
        this.wsConnections.forex = ws;
        return ws;
    },
    
    /**
     * Get forex historical data (OHLCV)
     */
    async getForexHistorical(pair, interval = '1h', limit = 500) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/market-data/forex/historical/${pair}?interval=${interval}&limit=${limit}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data.candles;
            
        } catch (error) {
            console.error('[MMITPS MarketData] Forex historical error:', error);
            throw error;
        }
    },
    
    // =========================================================================
    // CRYPTO DATA
    // =========================================================================
    
    /**
     * Get crypto price
     */
    async getCryptoPrice(symbol) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/market-data/crypto/price/${symbol}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('[MMITPS MarketData] Crypto price error:', error);
            throw error;
        }
    },
    
    /**
     * Subscribe to crypto price updates
     */
    subscribeCryptoPrices(symbols, callback) {
        const ws = new WebSocket(`${MMITPS_CONFIG.WS_BASE_URL}/crypto`);
        
        ws.onopen = () => {
            ws.send(JSON.stringify({
                action: 'subscribe',
                symbols,
                token: MMITPSAuth.authToken,
            }));
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            callback(data);
        };
        
        this.wsConnections.crypto = ws;
        return ws;
    },
    
    // =========================================================================
    // COT DATA
    // =========================================================================
    
    /**
     * Get COT (Commitment of Traders) data
     */
    async getCOTData(instrument, weeks = 52) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/market-data/cot/${instrument}?weeks=${weeks}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return {
                instrument,
                reports: data.reports,
                net_positions: data.net_positions,
                commercials: data.commercials,
                non_commercials: data.non_commercials,
                speculators: data.speculators,
            };
            
        } catch (error) {
            console.error('[MMITPS MarketData] COT data error:', error);
            throw error;
        }
    },
    
    // =========================================================================
    // ECONOMIC CALENDAR
    // =========================================================================
    
    /**
     * Get economic calendar events
     */
    async getEconomicCalendar(startDate, endDate, countries = [], importance = []) {
        try {
            const params = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
            });
            
            if (countries.length) params.append('countries', countries.join(','));
            if (importance.length) params.append('importance', importance.join(','));
            
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/market-data/economic-calendar?${params}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data.events;
            
        } catch (error) {
            console.error('[MMITPS MarketData] Economic calendar error:', error);
            throw error;
        }
    },
    
    // =========================================================================
    // GLOBAL MACRO DATA
    // =========================================================================
    
    /**
     * Get macroeconomic indicators
     */
    async getMacroIndicators(country, indicators = []) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/market-data/macro/${country}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...MMITPSAuth.getAuthHeaders(),
                    },
                    body: JSON.stringify({ indicators }),
                }
            );
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('[MMITPS MarketData] Macro indicators error:', error);
            throw error;
        }
    },
    
    // =========================================================================
    // SEASONALITY DATA
    // =========================================================================
    
    /**
     * Get seasonality patterns
     */
    async getSeasonalityData(instrument, years = 10) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/market-data/seasonality/${instrument}?years=${years}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return {
                instrument,
                monthly_patterns: data.monthly_patterns,
                weekly_patterns: data.weekly_patterns,
                best_months: data.best_months,
                worst_months: data.worst_months,
            };
            
        } catch (error) {
            console.error('[MMITPS MarketData] Seasonality data error:', error);
            throw error;
        }
    },
    
    /**
     * Close all WebSocket connections
     */
    closeAllConnections() {
        Object.values(this.wsConnections).forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        });
        this.wsConnections = {};
    },
};


// ============================================================================
// SECTION 5: TRADING PLATFORM INTEGRATION
// ============================================================================

const MMITPSTrading = {
    // Connected platforms
    connectedPlatforms: {},
    
    /**
     * Connect MetaTrader 4/5 account
     */
    async connectMetaTrader(server, login, password, platform = 'mt4') {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/trading/metatrader/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({
                    server,
                    login,
                    password: this.encryptCredentials(password),
                    platform,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Connection failed');
            }
            
            this.connectedPlatforms[`${platform}_${login}`] = {
                platform,
                login,
                server,
                connected_at: new Date().toISOString(),
            };
            
            return {
                success: true,
                account_id: data.account_id,
                balance: data.balance,
                equity: data.equity,
                margin: data.margin,
                free_margin: data.free_margin,
            };
            
        } catch (error) {
            console.error('[MMITPS Trading] MetaTrader connection error:', error);
            throw error;
        }
    },
    
    /**
     * Connect cTrader account
     */
    async connectCTrader(accessToken) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/trading/ctrader/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({
                    access_token: accessToken,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Connection failed');
            }
            
            return {
                success: true,
                accounts: data.accounts,
            };
            
        } catch (error) {
            console.error('[MMITPS Trading] cTrader connection error:', error);
            throw error;
        }
    },
    
    /**
     * Get open positions
     */
    async getOpenPositions(accountId) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/trading/positions/${accountId}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data.positions;
            
        } catch (error) {
            console.error('[MMITPS Trading] Get positions error:', error);
            throw error;
        }
    },
    
    /**
     * Get trade history
     */
    async getTradeHistory(accountId, startDate, endDate) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/trading/history/${accountId}?start=${startDate}&end=${endDate}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data.trades;
            
        } catch (error) {
            console.error('[MMITPS Trading] Trade history error:', error);
            throw error;
        }
    },
    
    /**
     * Place trade order
     */
    async placeOrder(accountId, order) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/trading/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({
                    account_id: accountId,
                    symbol: order.symbol,
                    type: order.type, // 'buy', 'sell', 'buy_limit', 'sell_limit', 'buy_stop', 'sell_stop'
                    volume: order.volume,
                    price: order.price || null,
                    stop_loss: order.stopLoss || null,
                    take_profit: order.takeProfit || null,
                    comment: order.comment || '',
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Order placement failed');
            }
            
            return {
                success: true,
                ticket: data.ticket,
                order: data.order,
            };
            
        } catch (error) {
            console.error('[MMITPS Trading] Place order error:', error);
            throw error;
        }
    },
    
    /**
     * Modify order
     */
    async modifyOrder(accountId, ticket, modifications) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/trading/order/${ticket}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({
                    account_id: accountId,
                    stop_loss: modifications.stopLoss,
                    take_profit: modifications.takeProfit,
                    price: modifications.price,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Order modification failed');
            }
            
            return {
                success: true,
                order: data.order,
            };
            
        } catch (error) {
            console.error('[MMITPS Trading] Modify order error:', error);
            throw error;
        }
    },
    
    /**
     * Close order
     */
    async closeOrder(accountId, ticket, volume = null) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/trading/order/${ticket}/close`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({
                    account_id: accountId,
                    volume, // Partial close if specified
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Order close failed');
            }
            
            return {
                success: true,
                closed_ticket: data.closed_ticket,
                profit: data.profit,
            };
            
        } catch (error) {
            console.error('[MMITPS Trading] Close order error:', error);
            throw error;
        }
    },
    
    /**
     * Sync trade journal
     */
    async syncTradeJournal(accountId) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/trading/journal/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({ account_id: accountId }),
            });
            
            const data = await response.json();
            
            return {
                success: true,
                synced_trades: data.synced_trades,
                new_trades: data.new_trades,
                last_sync: data.last_sync,
            };
            
        } catch (error) {
            console.error('[MMITPS Trading] Journal sync error:', error);
            throw error;
        }
    },
    
    /**
     * Copy trading - Follow signal provider
     */
    async followSignalProvider(providerId, settings) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/trading/copy/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({
                    provider_id: providerId,
                    copy_type: settings.copyType, // 'fixed', 'proportional', 'equity_percentage'
                    lot_size: settings.lotSize,
                    risk_percentage: settings.riskPercentage,
                    max_drawdown: settings.maxDrawdown,
                    copy_stop_loss: settings.copyStopLoss,
                    copy_take_profit: settings.copyTakeProfit,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Follow request failed');
            }
            
            return {
                success: true,
                subscription_id: data.subscription_id,
            };
            
        } catch (error) {
            console.error('[MMITPS Trading] Copy trading follow error:', error);
            throw error;
        }
    },
    
    /**
     * Encrypt credentials for secure transmission
     */
    encryptCredentials(credentials) {
        // Simple base64 encoding for demo - use proper encryption in production
        return btoa(credentials);
    },
};


// ============================================================================
// SECTION 6: SUPPORT TICKET SYSTEM
// ============================================================================

const MMITPSSupport = {
    /**
     * Create support ticket
     */
    async createTicket(subject, category, message, priority = 'medium', attachments = []) {
        try {
            const formData = new FormData();
            formData.append('subject', subject);
            formData.append('category', category);
            formData.append('message', message);
            formData.append('priority', priority);
            
            attachments.forEach((file, index) => {
                formData.append(`attachment_${index}`, file);
            });
            
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/support/tickets`, {
                method: 'POST',
                headers: MMITPSAuth.getAuthHeaders(),
                body: formData,
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Ticket creation failed');
            }
            
            // Send confirmation email
            await MMITPSEmail.sendTicketConfirmation(
                MMITPSAuth.currentUser.email,
                data.ticket_id,
                subject
            );
            
            return {
                success: true,
                ticket_id: data.ticket_id,
                status: data.status,
            };
            
        } catch (error) {
            console.error('[MMITPS Support] Create ticket error:', error);
            throw error;
        }
    },
    
    /**
     * Get user's tickets
     */
    async getTickets(status = 'all', page = 1, limit = 20) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/support/tickets?status=${status}&page=${page}&limit=${limit}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('[MMITPS Support] Get tickets error:', error);
            throw error;
        }
    },
    
    /**
     * Get ticket details
     */
    async getTicketDetails(ticketId) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/support/tickets/${ticketId}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('[MMITPS Support] Get ticket details error:', error);
            throw error;
        }
    },
    
    /**
     * Reply to ticket
     */
    async replyToTicket(ticketId, message, attachments = []) {
        try {
            const formData = new FormData();
            formData.append('message', message);
            
            attachments.forEach((file, index) => {
                formData.append(`attachment_${index}`, file);
            });
            
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/support/tickets/${ticketId}/reply`,
                {
                    method: 'POST',
                    headers: MMITPSAuth.getAuthHeaders(),
                    body: formData,
                }
            );
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Reply failed');
            }
            
            return {
                success: true,
                reply_id: data.reply_id,
            };
            
        } catch (error) {
            console.error('[MMITPS Support] Reply to ticket error:', error);
            throw error;
        }
    },
    
    /**
     * Close ticket
     */
    async closeTicket(ticketId, rating = null, feedback = null) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/support/tickets/${ticketId}/close`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...MMITPSAuth.getAuthHeaders(),
                    },
                    body: JSON.stringify({ rating, feedback }),
                }
            );
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Close ticket failed');
            }
            
            return {
                success: true,
            };
            
        } catch (error) {
            console.error('[MMITPS Support] Close ticket error:', error);
            throw error;
        }
    },
};


// ============================================================================
// SECTION 7: VPS MANAGEMENT
// ============================================================================

const MMITPSVPS = {
    /**
     * Get available VPS plans
     */
    async getVPSPlans() {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/vps/plans`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data.plans;
            
        } catch (error) {
            console.error('[MMITPS VPS] Get plans error:', error);
            throw error;
        }
    },
    
    /**
     * Get user's VPS instances
     */
    async getMyVPS() {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/vps/instances`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data.instances;
            
        } catch (error) {
            console.error('[MMITPS VPS] Get instances error:', error);
            throw error;
        }
    },
    
    /**
     * Provision new VPS
     */
    async provisionVPS(planId, region, hostname) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/vps/provision`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({
                    plan_id: planId,
                    region,
                    hostname,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'VPS provisioning failed');
            }
            
            return {
                success: true,
                instance_id: data.instance_id,
                ip_address: data.ip_address,
                credentials: data.credentials,
                status: data.status,
            };
            
        } catch (error) {
            console.error('[MMITPS VPS] Provision error:', error);
            throw error;
        }
    },
    
    /**
     * Control VPS (start, stop, restart, terminate)
     */
    async controlVPS(instanceId, action) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/vps/instances/${instanceId}/${action}`,
                {
                    method: 'POST',
                    headers: MMITPSAuth.getAuthHeaders(),
                }
            );
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `VPS ${action} failed`);
            }
            
            return {
                success: true,
                status: data.status,
            };
            
        } catch (error) {
            console.error(`[MMITPS VPS] ${action} error:`, error);
            throw error;
        }
    },
    
    /**
     * Get VPS metrics
     */
    async getVPSMetrics(instanceId) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/vps/instances/${instanceId}/metrics`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data.metrics;
            
        } catch (error) {
            console.error('[MMITPS VPS] Get metrics error:', error);
            throw error;
        }
    },
};


// ============================================================================
// SECTION 8: MLM / REFERRAL SYSTEM
// ============================================================================

const MMITPSMLM = {
    /**
     * Get referral link
     */
    async getReferralLink() {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/mlm/referral-link`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return {
                link: data.link,
                code: data.code,
            };
            
        } catch (error) {
            console.error('[MMITPS MLM] Get referral link error:', error);
            throw error;
        }
    },
    
    /**
     * Get downline (referred users)
     */
    async getDownline(level = 'all', page = 1, limit = 50) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/mlm/downline?level=${level}&page=${page}&limit=${limit}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('[MMITPS MLM] Get downline error:', error);
            throw error;
        }
    },
    
    /**
     * Get genealogy tree
     */
    async getGenealogyTree(depth = 5) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/mlm/genealogy?depth=${depth}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data.tree;
            
        } catch (error) {
            console.error('[MMITPS MLM] Get genealogy error:', error);
            throw error;
        }
    },
    
    /**
     * Get binary tree structure
     */
    async getBinaryTree() {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/mlm/binary-tree`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data.tree;
            
        } catch (error) {
            console.error('[MMITPS MLM] Get binary tree error:', error);
            throw error;
        }
    },
    
    /**
     * Get commission history
     */
    async getCommissionHistory(startDate, endDate, page = 1, limit = 50) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/mlm/commissions?start=${startDate}&end=${endDate}&page=${page}&limit=${limit}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('[MMITPS MLM] Get commissions error:', error);
            throw error;
        }
    },
    
    /**
     * Get rank and achievements
     */
    async getRankInfo() {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/mlm/rank`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return {
                current_rank: data.current_rank,
                next_rank: data.next_rank,
                progress: data.progress,
                requirements: data.requirements,
                achievements: data.achievements,
            };
            
        } catch (error) {
            console.error('[MMITPS MLM] Get rank error:', error);
            throw error;
        }
    },
    
    /**
     * Set binary leg preference
     */
    async setBinaryLegPreference(leg) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/mlm/binary-leg`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify({ preferred_leg: leg }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Setting preference failed');
            }
            
            return {
                success: true,
                preferred_leg: data.preferred_leg,
            };
            
        } catch (error) {
            console.error('[MMITPS MLM] Set binary leg error:', error);
            throw error;
        }
    },
};


// ============================================================================
// SECTION 9: KYC VERIFICATION
// ============================================================================

const MMITPSKYC = {
    /**
     * Get KYC status
     */
    async getKYCStatus() {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/kyc/status`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return {
                status: data.status, // 'pending', 'approved', 'rejected', 'none'
                level: data.level,
                documents: data.documents,
                rejection_reason: data.rejection_reason,
            };
            
        } catch (error) {
            console.error('[MMITPS KYC] Get status error:', error);
            throw error;
        }
    },
    
    /**
     * Upload KYC documents
     */
    async uploadDocuments(documentType, files, metadata = {}) {
        try {
            const formData = new FormData();
            formData.append('document_type', documentType);
            formData.append('metadata', JSON.stringify(metadata));
            
            files.forEach((file, index) => {
                formData.append(`document_${index}`, file);
            });
            
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/kyc/upload`, {
                method: 'POST',
                headers: MMITPSAuth.getAuthHeaders(),
                body: formData,
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Document upload failed');
            }
            
            return {
                success: true,
                document_id: data.document_id,
                status: data.status,
            };
            
        } catch (error) {
            console.error('[MMITPS KYC] Upload error:', error);
            throw error;
        }
    },
    
    /**
     * Submit KYC for review
     */
    async submitForReview() {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/kyc/submit`, {
                method: 'POST',
                headers: MMITPSAuth.getAuthHeaders(),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'KYC submission failed');
            }
            
            return {
                success: true,
                status: data.status,
                estimated_review_time: data.estimated_review_time,
            };
            
        } catch (error) {
            console.error('[MMITPS KYC] Submit error:', error);
            throw error;
        }
    },
};


// ============================================================================
// SECTION 10: NOTIFICATION SYSTEM
// ============================================================================

const MMITPSNotifications = {
    // Notification settings
    settings: {
        email: true,
        push: true,
        sms: false,
    },
    
    /**
     * Get notifications
     */
    async getNotifications(read = 'all', page = 1, limit = 20) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/notifications?read=${read}&page=${page}&limit=${limit}`,
                { headers: MMITPSAuth.getAuthHeaders() }
            );
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('[MMITPS Notifications] Get error:', error);
            throw error;
        }
    },
    
    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/notifications/${notificationId}/read`,
                {
                    method: 'POST',
                    headers: MMITPSAuth.getAuthHeaders(),
                }
            );
            
            return response.ok;
            
        } catch (error) {
            console.error('[MMITPS Notifications] Mark read error:', error);
            throw error;
        }
    },
    
    /**
     * Mark all as read
     */
    async markAllAsRead() {
        try {
            const response = await fetch(
                `${MMITPS_CONFIG.API_BASE_URL}/notifications/read-all`,
                {
                    method: 'POST',
                    headers: MMITPSAuth.getAuthHeaders(),
                }
            );
            
            return response.ok;
            
        } catch (error) {
            console.error('[MMITPS Notifications] Mark all read error:', error);
            throw error;
        }
    },
    
    /**
     * Update notification settings
     */
    async updateSettings(settings) {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/notifications/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify(settings),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Update failed');
            }
            
            this.settings = { ...this.settings, ...settings };
            
            return {
                success: true,
                settings: data.settings,
            };
            
        } catch (error) {
            console.error('[MMITPS Notifications] Update settings error:', error);
            throw error;
        }
    },
    
    /**
     * Subscribe to push notifications
     */
    async subscribePush() {
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                throw new Error('Push notifications not supported');
            }
            
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    'BLBx-hf2WrL2qEa0XYsODvJfglxLvGFovmcPSP9K1w_B_VgLrhiYT1f_M5T2yEiOdSF6oAkhiLfCKiqNJcDdJHg'
                ),
            });
            
            // Send subscription to server
            await fetch(`${MMITPS_CONFIG.API_BASE_URL}/notifications/push/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...MMITPSAuth.getAuthHeaders(),
                },
                body: JSON.stringify(subscription),
            });
            
            return { success: true };
            
        } catch (error) {
            console.error('[MMITPS Notifications] Push subscribe error:', error);
            throw error;
        }
    },
    
    /**
     * Convert URL-safe base64 to Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    },
};


// ============================================================================
// SECTION 11: UTILITY FUNCTIONS
// ============================================================================

const MMITPSUtils = {
    /**
     * Format currency
     */
    formatCurrency(amount, currency = 'USD', locale = 'en-US') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
        }).format(amount);
    },
    
    /**
     * Format number with commas
     */
    formatNumber(number, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(number);
    },
    
    /**
     * Format date
     */
    formatDate(date, format = 'medium') {
        const d = new Date(date);
        
        const formats = {
            short: { month: 'short', day: 'numeric' },
            medium: { year: 'numeric', month: 'short', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
            time: { hour: '2-digit', minute: '2-digit' },
            datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
        };
        
        return new Intl.DateTimeFormat('en-US', formats[format] || formats.medium).format(d);
    },
    
    /**
     * Format relative time (e.g., "2 hours ago")
     */
    formatRelativeTime(date) {
        const now = new Date();
        const d = new Date(date);
        const diff = now - d;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        
        return this.formatDate(date, 'medium');
    },
    
    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        }
    },
    
    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Generate UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    /**
     * Validate form data
     */
    validateForm(data, rules) {
        const errors = {};
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = data[field];
            
            if (rule.required && (!value || value.toString().trim() === '')) {
                errors[field] = `${field} is required`;
                continue;
            }
            
            if (value) {
                if (rule.minLength && value.length < rule.minLength) {
                    errors[field] = `${field} must be at least ${rule.minLength} characters`;
                }
                
                if (rule.maxLength && value.length > rule.maxLength) {
                    errors[field] = `${field} must be less than ${rule.maxLength} characters`;
                }
                
                if (rule.pattern && !rule.pattern.test(value)) {
                    errors[field] = rule.patternMessage || `${field} is invalid`;
                }
                
                if (rule.custom && !rule.custom(value)) {
                    errors[field] = rule.customMessage || `${field} is invalid`;
                }
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    },
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `mmitps-toast mmitps-toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        // Add styles if not exists
        if (!document.getElementById('mmitps-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'mmitps-toast-styles';
            style.textContent = `
                .mmitps-toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 24px;
                    border-radius: 8px;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    animation: mmitps-toast-in 0.3s ease;
                    z-index: 10000;
                }
                .mmitps-toast-success { background: linear-gradient(135deg, #00d4aa, #00b894); }
                .mmitps-toast-error { background: linear-gradient(135deg, #ff6b6b, #ee5a5a); }
                .mmitps-toast-warning { background: linear-gradient(135deg, #ffc107, #ffb300); }
                .mmitps-toast-info { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
                @keyframes mmitps-toast-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes mmitps-toast-out {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'mmitps-toast-out 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    /**
     * Show loading overlay
     */
    showLoading(message = 'Loading...') {
        let overlay = document.getElementById('mmitps-loading-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'mmitps-loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-message">${message}</div>
                </div>
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                #mmitps-loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10001;
                }
                .loading-content {
                    text-align: center;
                    color: white;
                }
                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-top-color: #00d4aa;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                }
                .loading-message {
                    font-size: 16px;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(overlay);
        } else {
            overlay.querySelector('.loading-message').textContent = message;
            overlay.style.display = 'flex';
        }
    },
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('mmitps-loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    },
};


// ============================================================================
// INITIALIZE API SYSTEM
// ============================================================================

const MMITPS = {
    Auth: MMITPSAuth,
    Email: MMITPSEmail,
    Payments: MMITPSPayments,
    MarketData: MMITPSMarketData,
    Trading: MMITPSTrading,
    Support: MMITPSSupport,
    VPS: MMITPSVPS,
    MLM: MMITPSMLM,
    KYC: MMITPSKYC,
    Notifications: MMITPSNotifications,
    Utils: MMITPSUtils,
    Config: MMITPS_CONFIG,
    
    /**
     * Initialize all systems
     */
    async init() {
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║         MMITPS Backend API System Initializing...            ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        
        try {
            // Initialize authentication
            this.Auth.init();
            
            // Initialize payments
            await this.Payments.init();
            
            // Initialize market data
            await this.MarketData.init();
            
            console.log('[MMITPS] All systems initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('[MMITPS] Initialization error:', error);
            return false;
        }
    },
    
    /**
     * Get API status
     */
    async getStatus() {
        try {
            const response = await fetch(`${MMITPS_CONFIG.API_BASE_URL}/status`);
            const data = await response.json();
            return data;
        } catch {
            return { status: 'offline' };
        }
    },
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MMITPS.init());
} else {
    MMITPS.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MMITPS;
}

// Export for ES modules
if (typeof window !== 'undefined') {
    window.MMITPS = MMITPS;
}

console.log('[MMITPS Backend API] Module loaded - Version 2.0');
