const MenuConfig = require('../models/MenuConfig');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

exports.getMenuConfigs = catchAsync(async (req, res) => {
    const configs = await MenuConfig.find();
    res.status(200).json(new ApiResponse(true, configs, 'Menu configurations retrieved successfully'));
});

exports.updateMenuConfig = catchAsync(async (req, res) => {
    const { label } = req.params;
    const updateData = req.body;

    let config = await MenuConfig.findOne({ label });

    if (config) {
        config = await MenuConfig.findOneAndUpdate({ label }, updateData, { new: true });
    } else {
        config = await MenuConfig.create({ label, ...updateData });
    }

    res.status(200).json(new ApiResponse(true, config, 'Menu configuration updated successfully'));
});

exports.deleteMenuConfig = catchAsync(async (req, res) => {
    const { label } = req.params;
    await MenuConfig.findOneAndDelete({ label });
    res.status(200).json(new ApiResponse(true, null, 'Menu configuration deleted successfully'));
});
