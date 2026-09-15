const UniversalPageService = require('../services/cms/UniversalPageService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.getPageContext = catchAsync(async (req, res) => {
    const { pageId } = req.params;
    const userId = req.user.id || req.user._id;
    const context = await UniversalPageService.getPageContext(pageId, userId);
    res.status(200).json(new ApiResponse(true, context, `Context for ${pageId} retrieved`));
});

exports.getBatchContext = catchAsync(async (req, res) => {
    const { pageIds } = req.body;
    const userId = req.user.id || req.user._id;
    const results = {};
    for (const id of pageIds) {
        results[id] = await UniversalPageService.getPageContext(id, userId);
    }
    res.status(200).json(new ApiResponse(true, results, 'Batch context retrieved'));
});
