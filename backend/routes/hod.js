const express=require('express');
const router=express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadAssignment,getForwardedAssignmentDetails } = require('../db/hod');

router.post('/hod', authenticateToken, uploadAssignment);
router.post('/hod1', authenticateToken, getForwardedAssignmentDetails);
module.exports=router;