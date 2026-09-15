const express = require("express");
const router = express.Router();
const ptdController = require("../controllers/ptdController");
const { protect } = require("../middleware/pg/auth");

// All routes require authentication
router.use(protect);

// Signal scanning
router.post("/scan", ptdController.scanSignals);

// Combination profiles
router.get("/combinations", ptdController.getCombinations);
router.post("/combinations", ptdController.saveCombination);

// Signal history
router.get("/signals", ptdController.getSignalHistory);

// Accuracy
router.get("/accuracy", ptdController.getAccuracy);
router.get("/accuracy/module/:id", ptdController.getModuleAccuracy);

// Backtesting
router.post("/backtest", ptdController.runBacktest);

// Alerts
router.get("/alerts", ptdController.getAlerts);
router.post("/alerts", ptdController.createAlert);
router.get("/alerts/history", ptdController.getAlertHistory);
router.delete("/alerts/:id", ptdController.deleteAlert);

// Broker (Alpaca)
router.post("/broker/connect", ptdController.connectBroker);
router.get("/broker/account", ptdController.getBrokerAccount);
router.post("/broker/trade", ptdController.executeTrade);
router.get("/broker/trades", ptdController.getTradeLog);

module.exports = router;
