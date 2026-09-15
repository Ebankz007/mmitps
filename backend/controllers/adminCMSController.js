const Menu = require('../models/CMS/Menu');
const Page = require('../models/CMS/Page');
const Media = require('../models/CMS/Media');
const NewsArticle = require('../models/News/NewsArticle');
const ContentBlock = require('../models/ContentBlock');
const SiteStatus = require('../models/System/SiteStatus');
const AnnealingService = require('../services/system/AnnealingService');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Get all menus
 * @route   GET /api/v1/admin/cms/menus
 */
exports.getMenus = async (req, res) => {
    try {
        const menus = await Menu.find().sort('name');
        res.status(200).json({ success: true, data: menus });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Create/Update Menu
 * @route   POST /api/v1/admin/cms/menus
 */
exports.upsertMenu = async (req, res) => {
    try {
        const { name, location, items, isActive } = req.body;
        let menu = await Menu.findOne({ location });

        if (menu) {
            menu.name = name || menu.name;
            menu.items = items || menu.items;
            menu.isActive = isActive !== undefined ? isActive : menu.isActive;
            await menu.save();
        } else {
            menu = await Menu.create({ name, location, items, isActive });
        }

        res.status(200).json({ success: true, data: menu });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all pages
 * @route   GET /api/v1/admin/cms/pages
 */
exports.getPages = async (req, res) => {
    try {
        const pages = await Page.find().sort('-createdAt');
        res.status(200).json({ success: true, data: pages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Create Page
 * @route   POST /api/v1/admin/cms/pages
 */
exports.createPage = async (req, res) => {
    try {
        const page = await Page.create(req.body);
        res.status(201).json({ success: true, data: page });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get single page
 * @route   GET /api/v1/admin/cms/pages/:id
 */
exports.getPage = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        res.status(200).json({ success: true, data: page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update Page
 * @route   PUT /api/v1/admin/cms/pages/:id
 */
exports.updatePage = async (req, res) => {
    try {
        const page = await Page.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        res.status(200).json({ success: true, data: page });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Delete Page
 * @route   DELETE /api/v1/admin/cms/pages/:id
 */
exports.deletePage = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        await page.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Upload Media
 * @route   POST /api/v1/admin/cms/media/upload
 */
exports.uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const media = await Media.create({
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            url: `/uploads/${req.file.filename}`,
            category: req.file.mimetype.startsWith('image') ? 'image' :
                req.file.mimetype.startsWith('video') ? 'video' : 'document',
            uploadedBy: req.user.id
        });

        res.status(201).json({ success: true, data: media });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all media
 * @route   GET /api/v1/admin/cms/media
 */
exports.getMedia = async (req, res) => {
    try {
        const media = await Media.find().sort('-createdAt');
        res.status(200).json({ success: true, data: media });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update Media metadata
 * @route   PUT /api/v1/admin/cms/media/:id
 */
exports.updateMedia = async (req, res) => {
    try {
        const media = await Media.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!media) {
            return res.status(404).json({ success: false, message: 'Media not found' });
        }
        res.status(200).json({ success: true, data: media });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Delete Media
 * @route   DELETE /api/v1/admin/cms/media/:id
 */
exports.deleteMedia = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ success: false, message: 'Media not found' });
        }

        // Delete file from storage
        const filePath = path.join(__dirname, '..', media.path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await media.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get Site Status & Health
 * @route   GET /api/v1/admin/cms/status
 */
exports.getSiteStatus = async (req, res) => {
    try {
        let status = await SiteStatus.findOne().sort('-createdAt');
        if (!status) {
            status = await SiteStatus.create({ version: '2.0.0' });
        }
        res.status(200).json({ success: true, data: status });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Trigger Self-Annealing
 * @route   POST /api/v1/admin/cms/anneal
 */
exports.triggerAnnealing = async (req, res) => {
    try {
        const reports = await AnnealingService.runFullAnnealing();
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Toggle Maintenance Mode
 * @route   PUT /api/v1/admin/cms/maintenance
 */
exports.toggleMaintenance = async (req, res) => {
    try {
        const { isMaintenanceMode, maintenanceMessage } = req.body;
        let status = await SiteStatus.findOne();
        if (!status) status = new SiteStatus();

        status.isMaintenanceMode = isMaintenanceMode;
        if (maintenanceMessage) status.maintenanceMessage = maintenanceMessage;

        await status.save();
        res.status(200).json({ success: true, data: status });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all News Articles
 * @route   GET /api/v1/admin/cms/news
 */
exports.getNewsArticles = async (req, res) => {
    try {
        const articles = await NewsArticle.find().sort('-createdAt');
        res.status(200).json({ success: true, count: articles.length, data: articles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all Content Blocks (Events, etc)
 * @route   GET /api/v1/admin/cms/blocks
 */
exports.getContentBlocks = async (req, res) => {
    try {
        const { type } = req.query;
        const filter = type ? { type } : {};
        const blocks = await ContentBlock.find(filter).sort('-createdAt');
        res.status(200).json({ success: true, count: blocks.length, data: blocks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
