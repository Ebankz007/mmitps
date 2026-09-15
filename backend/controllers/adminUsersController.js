const User = require('../models/User');
const Subscription = require('../models/Subscription');

// @desc    Create new user
// @route   POST /api/v1/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    try {
        const { email, username, password, role, isActive } = req.body;

        const user = await User.create({
            email,
            username,
            password,
            role: role || 'user',
            isActive: isActive !== undefined ? isActive : true,
            emailVerified: true // Auto-verify admin-created users
        });

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all users with pagination
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const { role, search, status, page = 1, limit = 20 } = req.query;

        let query = {};

        // Filter by role
        if (role) {
            query.role = role;
        }

        // Search by email/username
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Populate subscription info
        const usersWithSubs = await Promise.all(users.map(async (user) => {
            const subscription = await Subscription.findOne({ user: user._id })
                .populate('plan', 'name code');
            return {
                ...user.toObject(),
                subscription: subscription || null
            };
        }));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: usersWithSubs
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Get subscription
        const subscription = await Subscription.findOne({ user: user._id })
            .populate('plan');

        res.status(200).json({
            success: true,
            data: {
                ...user.toObject(),
                subscription: subscription || null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const allowedFields = ['email', 'username', 'role', 'isActive'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get  user stats
// @route   GET /api/v1/admin/users/stats
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const adminUsers = await User.countDocuments({ role: 'admin' });

        // New users last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        res.status(200).json({
            success: true,
            data: {
                total: totalUsers,
                active: activeUsers,
                admins: adminUsers,
                newLast30Days: newUsers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Impersonate user (generate token)
// @route   POST /api/v1/admin/users/:id/impersonate
// @access  Private/Admin
exports.impersonateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Generate JWT (would need jwt utility)
        // const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Impersonation feature requires JWT implementation',
            data: { userId: user._id, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
