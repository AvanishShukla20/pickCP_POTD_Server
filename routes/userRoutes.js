const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getUser } = require('../controllers/userController');


router.get("/user", authMiddleware, getUser);

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
