const SocialTradingService = require('../services/trading/SocialTradingService');
const Signal = require('../models/Signal');
const SocialTrading = require('../models/SocialTrading');

class SocialTradingController {
    /**
     * Get leaderboard
     * GET /api/v1/social/leaderboard
     */
    async getLeaderboard(req, res) {
        try {
            const { limit = 50, sortBy = 'winRate' } = req.query;
            const traders = await SocialTradingService.getTopTraders(parseInt(limit), sortBy);

            res.json({
                success: true,
                data: traders,
                count: traders.length
            });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch leaderboard',
                error: error.message
            });
        }
    }

    /**
     * Get trader profile
     * GET /api/v1/social/traders/:id
     */
    async getTraderProfile(req, res) {
        try {
            const { id } = req.params;
            const trader = await SocialTradingService.getTraderProfile(id);

            if (!trader) {
                return res.status(404).json({
                    success: false,
                    message: 'Trader not found'
                });
            }

            res.json({
                success: true,
                data: trader
            });
        } catch (error) {
            console.error('Error fetching trader profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch trader profile',
                error: error.message
            });
        }
    }

    /**
     * Get trader performance
     * GET /api/v1/social/traders/:id/performance
     */
    async getTraderPerformance(req, res) {
        try {
            const { id } = req.params;
            const { period = '30d' } = req.query;

            const performance = await SocialTradingService.getTraderPerformance(id, period);

            if (!performance) {
                return res.status(404).json({
                    success: false,
                    message: 'Trader not found'
                });
            }

            res.json({
                success: true,
                data: performance
            });
        } catch (error) {
            console.error('Error fetching trader performance:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch trader performance',
                error: error.message
            });
        }
    }

    /**
     * Follow a trader
     * POST /api/v1/social/follow/:id
     */
    async followTrader(req, res) {
        try {
            const traderId = req.params.id;
            const followerId = req.user.id;

            if (traderId === followerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot follow yourself'
                });
            }

            const follow = await SocialTradingService.followTrader(followerId, traderId);

            // Emit notification to trader
            const wsServer = req.app.get('wsServer');
            if (wsServer) {
                wsServer.emitNotification(traderId, {
                    type: 'new_follower',
                    title: 'New Follower',
                    message: `You have a new follower!`,
                    data: { followerId }
                });
            }

            res.json({
                success: true,
                data: follow,
                message: 'Successfully followed trader'
            });
        } catch (error) {
            console.error('Error following trader:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Unfollow a trader
     * DELETE /api/v1/social/follow/:id
     */
    async unfollowTrader(req, res) {
        try {
            const traderId = req.params.id;
            const followerId = req.user.id;

            await SocialTradingService.unfollowTrader(followerId, traderId);

            res.json({
                success: true,
                message: 'Successfully unfollowed trader'
            });
        } catch (error) {
            console.error('Error unfollowing trader:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Start copying a trader
     * POST /api/v1/social/copy/:id
     */
    async copyTrader(req, res) {
        try {
            const traderId = req.params.id;
            const copierId = req.user.id;
            const settings = req.body;

            const copyRelation = await SocialTradingService.copyTrader(copierId, traderId, settings);

            // Emit notification to trader
            const wsServer = req.app.get('wsServer');
            if (wsServer) {
                wsServer.emitNotification(traderId, {
                    type: 'new_copier',
                    title: 'New Copier',
                    message: `Someone started copying your trades!`,
                    data: { copierId }
                });
            }

            res.json({
                success: true,
                data: copyRelation,
                message: 'Successfully started copying trader'
            });
        } catch (error) {
            console.error('Error copying trader:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Stop copying a trader
     * DELETE /api/v1/social/copy/:id
     */
    async stopCopying(req, res) {
        try {
            const traderId = req.params.id;
            const copierId = req.user.id;

            await SocialTradingService.stopCopying(copierId, traderId);

            res.json({
                success: true,
                message: 'Successfully stopped copying trader'
            });
        } catch (error) {
            console.error('Error stopping copy:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Publish a trading signal
     * POST /api/v1/social/signals
     */
    async publishSignal(req, res) {
        try {
            const traderId = req.user.id;
            const signalData = {
                ...req.body,
                traderName: req.user.name
            };

            const signal = await SocialTradingService.publishSignal(traderId, signalData);

            // Emit signal to all followers via WebSocket
            const wsServer = req.app.get('wsServer');
            if (wsServer) {
                wsServer.emitSignal(traderId, signal);
            }

            res.json({
                success: true,
                data: signal,
                message: 'Signal published successfully'
            });
        } catch (error) {
            console.error('Error publishing signal:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to publish signal',
                error: error.message
            });
        }
    }

    /**
     * Get trader's signals
     * GET /api/v1/social/traders/:id/signals
     */
    async getTraderSignals(req, res) {
        try {
            const { id } = req.params;
            const { limit = 20, status } = req.query;

            const signals = await SocialTradingService.getTraderSignals(id, parseInt(limit), status);

            res.json({
                success: true,
                data: signals,
                count: signals.length
            });
        } catch (error) {
            console.error('Error fetching trader signals:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch signals',
                error: error.message
            });
        }
    }

    /**
     * Get signal feed from followed traders
     * GET /api/v1/social/signals/feed
     */
    async getSignalFeed(req, res) {
        try {
            const userId = req.user.id;
            const { limit = 50 } = req.query;

            const signals = await SocialTradingService.getFollowedSignals(userId, parseInt(limit));

            res.json({
                success: true,
                data: signals,
                count: signals.length
            });
        } catch (error) {
            console.error('Error fetching signal feed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch signal feed',
                error: error.message
            });
        }
    }

    /**
     * Close a signal
     * PUT /api/v1/social/signals/:id/close
     */
    async closeSignal(req, res) {
        try {
            const { id } = req.params;
            const { closePrice } = req.body;
            const traderId = req.user.id;

            const signal = await Signal.findById(id);

            if (!signal) {
                return res.status(404).json({
                    success: false,
                    message: 'Signal not found'
                });
            }

            if (signal.traderId.toString() !== traderId) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to close this signal'
                });
            }

            signal.closeSignal(closePrice);
            await signal.save();

            // Update trader performance metrics
            await SocialTradingService.calculatePerformanceMetrics(traderId);

            // Emit signal update
            const wsServer = req.app.get('wsServer');
            if (wsServer) {
                wsServer.emitSignalUpdate(traderId, signal);
            }

            res.json({
                success: true,
                data: signal,
                message: 'Signal closed successfully'
            });
        } catch (error) {
            console.error('Error closing signal:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to close signal',
                error: error.message
            });
        }
    }

    /**
     * Update social handles
     * PUT /api/v1/social/profile/handles
     */
    async updateSocialHandles(req, res) {
        try {
            const userId = req.user.id;
            const handles = req.body;

            const updatedProfile = await SocialTradingService.updateSocialHandles(userId, handles);

            if (!updatedProfile) {
                return res.status(404).json({
                    success: false,
                    message: 'Social trading profile not found'
                });
            }

            res.json({
                success: true,
                data: updatedProfile.socialHandles,
                message: 'Social handles updated successfully'
            });
        } catch (error) {
            console.error('Error updating social handles:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update social handles',
                error: error.message
            });
        }
    }
    /**
     * Register a specific trading account as a signal provider
     * POST /api/v1/social/register-as-provider
     */
    async registerAsProvider(req, res) {
        try {
            const userId = req.user._id;
            const {
                accountId, // Target account to become a master
                displayName,
                bio,
                tradingStyle = 'mixed',
                riskLevel = 'moderate',
                preferredMarkets = [],
                performanceFee = 20,
                managementFee = 0
            } = req.body;

            if (!displayName || !accountId) {
                return res.status(400).json({
                    success: false,
                    message: 'displayName and accountId are required'
                });
            }

            // 1. Enforce Master Account Limit (Up to 3 per profile)
            const TradingAccount = require('../models/Trading/TradingAccount');
            const masterAccountsCount = await TradingAccount.countDocuments({ 
                user: userId, 
                isProvider: true 
            });

            if (masterAccountsCount >= 3) {
                return res.status(400).json({
                    success: false,
                    message: 'Master account limit reached. Each profile can have a maximum of 3 master accounts.'
                });
            }

            // 2. Resolve and Update the Trading Account
            const account = await TradingAccount.findOne({ _id: accountId, user: userId });
            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: 'Trading account not found'
                });
            }

            if (account.isProvider) {
                return res.status(400).json({
                    success: false,
                    message: 'This account is already registered as a provider'
                });
            }

            account.isProvider = true;
            account.providerProfile = {
                name: displayName,
                description: bio,
                strategy: tradingStyle,
                performanceFee,
                managementFee,
                riskScore: riskLevel === 'conservative' ? 3 : riskLevel === 'moderate' ? 5 : 8
            };
            await account.save();

            // 3. Ensure a global SocialTrading profile exists for this user
            let socialProfile = await SocialTrading.findOne({ userId });
            if (!socialProfile) {
                socialProfile = await SocialTrading.create({
                    userId,
                    displayName,
                    bio,
                    tradingStyle,
                    riskLevel,
                    preferredMarkets,
                    isProvider: true,
                    status: 'active'
                });
            }

            // 4. Promote user role if necessary
            if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
                req.user.role = 'provider';
                req.user.isProvider = true;
                await req.user.save();
            }

            res.status(201).json({
                success: true,
                data: { account, socialProfile },
                message: 'Successfully registered account as a provider'
            });
        } catch (error) {
            console.error('Error registering as provider:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to register as provider',
                error: error.message
            });
        }
    }
}

module.exports = new SocialTradingController();
