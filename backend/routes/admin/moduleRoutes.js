const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/pg/auth');
const ModuleRepository = require('../../repositories/pg/ModuleRepository');
const ApiError = require('../../utils/ApiError');

// Protected admin routes
router.use(protect);
router.use(authorize('admin', 'super_admin'));

/**
 * @route   GET /api/admin/modules
 * @desc    Get all available recurring modules
 * @access  Private/Admin
 */
router.get('/', async (req, res, next) => {
    try {
        const modules = await ModuleRepository.findAll({}, { sort: 'createdAt', direction: 'desc' });
        res.status(200).json({
            success: true,
            data: modules
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/admin/modules
 * @desc    Create a new recurring subscription module
 * @access  Private/Admin
 */
router.post('/', async (req, res, next) => {
    try {
        const newModule = await ModuleRepository.create(req.body);
        res.status(201).json({
            success: true,
            data: newModule
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   PUT /api/admin/modules/:id
 * @desc    Update module properties including tier price overrides
 * @access  Private/Admin
 */
router.put('/:id', async (req, res, next) => {
    try {
        const updatedModule = await ModuleRepository.update(req.params.id, req.body);

        if (!updatedModule) {
            throw new ApiError(404, 'Module not found');
        }

        res.status(200).json({
            success: true,
            data: updatedModule
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   DELETE /api/admin/modules/:id
 * @desc    Delete a module
 * @access  Private/Admin
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const deletedModule = await ModuleRepository.delete(req.params.id);
        if (!deletedModule) throw new ApiError(404, 'Module not found');

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;