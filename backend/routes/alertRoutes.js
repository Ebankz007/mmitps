const express = require("express");
const alertController = require("../controllers/alertController");
const { protect } = require("../middleware/pg/auth");

const router = express.Router();

// All routes are protected
router.use(protect);

router
    .route("/")
    .get(alertController.getAlerts)
    .post(alertController.createAlert);

router
    .route("/history")
    .get(alertController.getAlertHistory);

router
    .route("/:id")
    .patch(alertController.toggleAlert)
    .delete(alertController.deleteAlert);

module.exports = router;
