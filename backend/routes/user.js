const express = require('express');
const router = express.Router();
const {register,fetchAllCounts} = require('../db/user');
router.post('/register', register);
router.get("/fetchallcounts",fetchAllCounts);
module.exports = router;