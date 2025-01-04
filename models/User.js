// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hash this in production
    post: { type: String, default: 'Student' },
    imageUri: { type: String, default: 'https://bit.ly/3T5Uk5W' },
    status: { type: String, default: "Hey There I'm Using this Application" }
});

module.exports = mongoose.model('User', userSchema);
