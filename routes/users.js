// routes/users.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = new User({ email, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully!' });
        console.log("pinged")
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Check if User Exists
router.post('/check', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        res.json({ exists: !!user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
