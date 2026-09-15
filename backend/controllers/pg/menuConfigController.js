/**
 * MenuConfigController — PostgreSQL edition.
 * Backed by the menus table (location-keyed, unique per location).
 */
const MenuRepository = require('../../repositories/pg/MenuRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

exports.getMenuConfigs = catchAsync(async (req, res) => {
    const menus = await MenuRepository.findAll({}, { sort: 'location' });
    res.status(200).json(new ApiResponse(true, menus, 'Menu configs retrieved'));
});

exports.updateMenuConfig = catchAsync(async (req, res) => {
    const { label } = req.params;
    const { items, isActive, name } = req.body;

    const existing = await MenuRepository.findByLocation(label);
    if (!existing) {
        throw new ApiError(404, `Menu config '${label}' not found`);
    }

    const updated = await MenuRepository.update(existing.id, {
        ...(items !== undefined ? { items } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(name !== undefined ? { name } : {}),
    });

    res.status(200).json(new ApiResponse(true, updated, `Menu config '${label}' updated`));
});

exports.deleteMenuConfig = catchAsync(async (req, res) => {
    const { label } = req.params;

    const existing = await MenuRepository.findByLocation(label);
    if (!existing) {
        throw new ApiError(404, `Menu config '${label}' not found`);
    }

    await MenuRepository.delete(existing.id);
    res.status(200).json(new ApiResponse(true, null, `Menu config '${label}' deleted`));
});