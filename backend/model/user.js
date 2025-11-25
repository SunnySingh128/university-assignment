const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true // optional: ensures usernames are unique
  },
  role: {
    type: String,
    required: true,
    enum: ['student','professor','hod'], // optional: limit to allowed roles
    default: 'user'
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

const model= mongoose.model('User', userSchema);
module.exports = model;
