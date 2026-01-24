const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {register,fetchAllCounts} = require('../db/user');
router.post('/register', register);
router.get("/fetchallcounts", authenticateToken, fetchAllCounts);
module.exports = router;