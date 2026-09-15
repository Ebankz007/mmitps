const SiteContent = require('../models/SiteContent');

/**
 * @desc    Get all content sections for a page
 * @route   GET /api/v1/site-content/:page
 * @access  Public
 */
exports.getPageContent = async (req, res) => {
    try {
        const { page } = req.params;
        const filter = { page, isActive: true };

        const sections = await SiteContent.find(filter).sort({ sortOrder: 1 });

        res.status(200).json({
            success: true,
            count: sections.length,
            data: sections
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all site content (admin — includes inactive)
 * @route   GET /api/v1/site-content
 * @access  Admin
 */
exports.getAllContent = async (req, res) => {
    try {
        const filter = {};
        if (req.query.page) filter.page = req.query.page;
        if (req.query.type) filter.type = req.query.type;

        const sections = await SiteContent.find(filter).sort({ page: 1, sortOrder: 1 });

        res.status(200).json({
            success: true,
            count: sections.length,
            data: sections
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get single content section by slug
 * @route   GET /api/v1/site-content/slug/:slug
 * @access  Public
 */
exports.getBySlug = async (req, res) => {
    try {
        const section = await SiteContent.findOne({ slug: req.params.slug });
        if (!section) {
            return res.status(404).json({ success: false, message: 'Content section not found' });
        }
        res.status(200).json({ success: true, data: section });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Create content section
 * @route   POST /api/v1/site-content
 * @access  Admin
 */
exports.createContent = async (req, res) => {
    try {
        const section = await SiteContent.create(req.body);
        res.status(201).json({ success: true, data: section });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update content section
 * @route   PUT /api/v1/site-content/:id
 * @access  Admin
 */
exports.updateContent = async (req, res) => {
    try {
        let section = await SiteContent.findById(req.params.id);
        if (!section) {
            return res.status(404).json({ success: false, message: 'Content section not found' });
        }

        section = await SiteContent.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: section });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Delete content section
 * @route   DELETE /api/v1/site-content/:id
 * @access  Admin
 */
exports.deleteContent = async (req, res) => {
    try {
        const section = await SiteContent.findById(req.params.id);
        if (!section) {
            return res.status(404).json({ success: false, message: 'Content section not found' });
        }

        await section.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Upsert content section by slug (create or update)
 * @route   PUT /api/v1/site-content/slug/:slug
 * @access  Admin
 */
exports.upsertBySlug = async (req, res) => {
    try {
        const section = await SiteContent.findOneAndUpdate(
            { slug: req.params.slug },
            req.body,
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: section });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Bulk upsert content sections for a page
 * @route   POST /api/v1/site-content/bulk/:page
 * @access  Admin
 */
exports.bulkUpsert = async (req, res) => {
    try {
        const { page } = req.params;
        const { sections } = req.body;

        if (!Array.isArray(sections)) {
            return res.status(400).json({ success: false, message: 'sections must be an array' });
        }

        const results = [];

        for (const section of sections) {
            const doc = await SiteContent.findOneAndUpdate(
                { slug: section.slug },
                { ...section, page },
                { new: true, upsert: true, runValidators: true }
            );
            results.push(doc);
        }

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
