const express = require('express');
const {
    getMenus,
    upsertMenu,
    getPages,
    createPage,
    getPage,
    updatePage,
    deletePage,
    uploadMedia,
    getMedia,
    getMediaById,
    updateMedia,
    deleteMedia,
    getSiteStatus,
    triggerAnnealing,
    toggleMaintenance,
    getNewsArticles,
    getContentBlocks
} = require('../controllers/pg/adminCMSController');
const { protect, authorize } = require('../middleware/pg/auth');
const cmsUpload = require('../middleware/cmsUpload');

const router = express.Router();

// All routes here are protected and require admin role
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Menus
router.route('/menus')
    .get(getMenus)
    .post(upsertMenu);

// Pages
router.route('/pages')
    .get(getPages)
    .post(createPage);

router.route('/pages/:id')
    .get(getPage)
    .put(updatePage)
    .delete(deletePage);

// Media
router.route('/media')
    .get(getMedia);

router.post('/media/upload', cmsUpload.single('file'), uploadMedia);

router.route('/media/:id')
    .get(getMediaById)
    .put(updateMedia)
    .delete(deleteMedia);

// Site Status & Annealing
router.get('/status', getSiteStatus);
router.post('/anneal', triggerAnnealing);
router.put('/maintenance', toggleMaintenance);

// News Management
router.get('/news', getNewsArticles);
// Events/ContentBlocks Management
router.get('/blocks', getContentBlocks);

module.exports = router;
