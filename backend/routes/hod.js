const express=require('express');
const router=express.Router();
const { uploadAssignment,getForwardedAssignmentDetails } = require('../db/hod');

router.post('/hod',uploadAssignment);
router.post('/hod1',getForwardedAssignmentDetails);
module.exports=router;