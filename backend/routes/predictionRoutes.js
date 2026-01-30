const express = require('express');
const controller = require('../controllers/predictionController');

const router = express.Router();

// Fallback if controller is not loaded correctly
if (!controller.predictCondition || !controller.getConditionHistory) {
    console.error("CRITICAL ERROR: Prediction Controller functions are undefined!", controller);
}

router.post('/condition', controller.predictCondition);
router.get('/condition/history', controller.getConditionHistory);

module.exports = router;
