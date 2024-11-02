const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register with email/password
router.post('/register', async (req, res) => {
    try {
        const { email, password, displayName, post } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Account Already Exists! Please Login.' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            userId: new mongoose.Types.ObjectId().toString(),
            displayName: displayName || email.substring(0, email.indexOf('@')),
            email,
            password: hashedPassword,
            post,
            imageUri: "https://bit.ly/3T5Uk5W",
            status: "Hey There I'm Using this Application"
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.userId }, 
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: {
                userId: user.userId,
                displayName: user.displayName,
                email: user.email,
                post: user.post,
                imageUri: user.imageUri,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Registration failed', 
            error: error.message 
        });
    }
});

// Google Sign In
router.post('/google-signin', async (req, res) => {
    try {
        const { googleId, email, displayName, post } = req.body;

        let user = await User.findOne({ email });
        
        if (!user) {
            // Create new user
            user = new User({
                userId: new mongoose.Types.ObjectId().toString(),
                displayName,
                email,
                googleId,
                post,
                imageUri: "https://bit.ly/3T5Uk5W",
                status: "Hey There I'm Using this Application"
            });
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.userId },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                userId: user.userId,
                displayName: user.displayName,
                email: user.email,
                post: user.post,
                imageUri: user.imageUri,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Google sign-in error:', error);
        res.status(500).json({ 
            message: 'Google sign-in failed', 
            error: error.message 
        });
    }
});

module.exports = router;