const ContentBlock = require('../models/ContentBlock');

/**
 * @desc    Get all content blocks (optional type filter)
 * @route   GET /api/cms?type=article
 * @access  Public (for fetching content)
 */
exports.getBlocks = async (req, res) => {
    try {
        const filter = {};
        if (req.query.type) {
            filter.type = req.query.type;
        }
        // If not admin, maybe only show active ones?
        // For now, let's return all and let frontend decide or filter by active
        if (!req.user || req.user.role !== 'admin') {
            filter.isActive = true;
        }

        const blocks = await ContentBlock.find(filter).sort('-createdAt');
        res.status(200).json({ success: true, count: blocks.length, data: blocks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get single content block by slug
 * @route   GET /api/cms/:slug
 * @access  Public
 */
exports.getBlock = async (req, res) => {
    try {
        const block = await ContentBlock.findOne({ slug: req.params.slug });
        if (!block) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }
        res.status(200).json({ success: true, data: block });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Create new content block
 * @route   POST /api/cms
 * @access  Private/Admin
 */
exports.createBlock = async (req, res) => {
    try {
        req.body.author = req.user.id;
        const block = await ContentBlock.create(req.body);
        res.status(201).json({ success: true, data: block });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update content block
 * @route   PUT /api/cms/:id
 * @access  Private/Admin
 */
exports.updateBlock = async (req, res) => {
    try {
        let block = await ContentBlock.findById(req.params.id);
        if (!block) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        block = await ContentBlock.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: block });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Delete content block
 * @route   DELETE /api/cms/:id
 * @access  Private/Admin
 */
exports.deleteBlock = async (req, res) => {
    try {
        const block = await ContentBlock.findById(req.params.id);
        if (!block) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        await block.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
