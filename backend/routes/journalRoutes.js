/**
 * Journal routes — PostgreSQL edition.
 */
const express = require('express');
const router = express.Router();
const TradeJournalController = require('../controllers/pg/tradeJournalController');
const { protect } = require('../middleware/pg/auth');

router.use(protect); // Protect all routes

router.get('/my', TradeJournalController.getMyJournal);
router.get('/stats', TradeJournalController.getJournalStats);
router.post('/add', TradeJournalController.addTrade);
router.put('/:id', TradeJournalController.updateTrade);

module.exports = router;