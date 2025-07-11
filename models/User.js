const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  college: String,
  codeforcesHandle: String,
  email: { type: String, unique: true },
  password: String,
  potd: [
  {
    date: String,
    problemId: String,
    status: { type: String, enum: ['pending', 'solved'], default: 'pending' },
  }
]

});

const User = mongoose.model('User', userSchema);
module.exports = User;