// models/Assignment.js
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  title: { 
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true   // file path or cloud URL
  },
  status: {
    type: String,
    default: "Draft",
  },
  professor:{
    type:String,
    required:true,
  },
  feedback:{
    type:String,
    required:false,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Assignment", assignmentSchema);
