const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getRandomProblem, markPOTD, getSolvedDates } = require('../controllers/cfController');

// Generate POTD (get random problem)
router.post("/potd", authMiddleware, getRandomProblem);

// Mark problem of the day as solved
router.post("/mark-potd", authMiddleware, markPOTD);

// Get solved dates
router.get('/get-solved-dates', authMiddleware, getSolvedDates);

module.exports = router;
