// routes/users.js
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    const { 
        email, 
        password,
        displayName,
        post,
        imageUri,
        status 
    } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Account Already Exists! Please Login.'
            });
        }

        // Create new user
        const user = new User({
            email,
            password, // Note: You should hash this password before saving
            displayName,
            post,
            imageUri,
            status
        });

        await user.save();

        // Return success response matching Android client expectations
        res.status(200).json({
            success: true,
            message: 'Registration successful',
            uid: user._id.toString() // Converting MongoDB ObjectId to string
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Check if User Exists
router.post('/check', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        res.json({ 
            success: true,
            exists: !!user 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: err.message 
        });
    }
});

module.exports = router;