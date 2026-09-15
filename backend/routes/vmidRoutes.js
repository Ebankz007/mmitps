const express = require("express");
const router = express.Router();
const vmidController = require("../controllers/vmidController");
const { protect } = require("../middleware/pg/auth");

// All VMID routes require authentication
router.use(protect);

// Core Data Feeds
router.get("/market-data", vmidController.getMarketData);
router.get("/watchlist", vmidController.getWatchlist);

// Contextual Modules
router.get("/open-interest", vmidController.getOpenInterest);
router.get("/cot", vmidController.getCOTData);
router.get("/correlation", vmidController.getCorrelationMatrix);

// Livestream (Mux external integration)
router.get("/streams/active", vmidController.getActiveStreams);
router.post("/streams/create", vmidController.createLiveStream);

module.exports = router;
