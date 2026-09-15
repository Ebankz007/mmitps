const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

// In a real app, this would be a Mongoose model
let mockAlerts = [
    { id: 1, instrument: "Gold", metric: "zScore", operator: ">", threshold: 2.0, isActive: true, createdAt: new Date() },
    { id: 2, instrument: "BTC/USD", metric: "volumeROC", operator: ">", threshold: 200, isActive: false, createdAt: new Date() },
];

exports.getAlerts = catchAsync(async (req, res, next) => {
    res.status(200).json({
        status: "success",
        results: mockAlerts.length,
        data: {
            alerts: mockAlerts
        }
    });
});

exports.createAlert = catchAsync(async (req, res, next) => {
    const { instrument, metric, operator, threshold } = req.body;

    if (!instrument || !metric || !operator || threshold === undefined) {
        return next(ApiError.badRequest("Please provide all required alert fields"));
    }

    const newAlert = {
        id: mockAlerts.length + 1,
        instrument,
        metric,
        operator,
        threshold,
        isActive: true,
        createdAt: new Date()
    };

    mockAlerts.push(newAlert);

    res.status(201).json({
        status: "success",
        data: {
            alert: newAlert
        }
    });
});

exports.toggleAlert = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const alert = mockAlerts.find(a => a.id === parseInt(id));

    if (!alert) {
        return next(ApiError.notFound("Alert not found"));
    }

    alert.isActive = !alert.isActive;

    res.status(200).json({
        status: "success",
        data: {
            alert
        }
    });
});

exports.deleteAlert = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    mockAlerts = mockAlerts.filter(a => a.id !== parseInt(id));

    res.status(204).json({
        status: "success",
        data: null
    });
});

exports.getAlertHistory = catchAsync(async (req, res, next) => {
    // Mock signal breaches / alert triggers
    const history = [
        { id: 101, instrument: "Gold", metric: "zScore", value: 2.4, threshold: 2.0, time: new Date(Date.now() - 3600000) },
        { id: 102, instrument: "S&P 500", metric: "volumeROC", value: 185.2, threshold: 150, time: new Date(Date.now() - 7200000) },
    ];

    res.status(200).json({
        status: "success",
        data: {
            history
        }
    });
});
