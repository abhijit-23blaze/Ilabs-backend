const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
//const Post = require('../models/Post');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with hashed password
        const user = new User({
            email,
            password: hashedPassword, // Store the hashed password
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
            uid: user._id.toString()
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User does not exist'
            });
        }

        // Compare password with hashed password in database
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Return success response
        res.json({
            success: true,
            message: 'Login successful',
            uid: user._id.toString(),
            email: user.email
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

router.get('/data', async (req, res) => {
    const { uid } = req.query; // Assuming UID is passed as a query parameter

    try {
        const user = await User.findById(uid); // Find user by UID

        console.log(user.displayName);
        console.log(user.email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        

        // Return user data (you can add/remove fields based on your needs)
        res.json({
            success: true,
            userData: {
                displayName: user.displayName,
                post: user.post,
                imageUri: user.imageUri,
                status: user.status
            }
        });
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user data'
        });
    }
});


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

router.get('/profile/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            userData: {
                email: user.email,
                name: user.displayName,
                postinIIIT: user.post,
                imageUri: user.imageUri,
                status: user.status,
                roles: user.roles || []
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
    try {
        const updates = {};
        if (req.body.imageUri) updates.imageUri = req.body.imageUri;
        if (req.body.status) updates.status = req.body.status;
        if (req.body.name) updates.displayName = req.body.name;
        if (req.body.post) updates.post = req.body.post;

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: updates },
            { new: true }
        );

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            userData: {
                email: user.email,
                name: user.displayName,
                postinIIIT: user.post,
                imageUri: user.imageUri,
                status: user.status,
                roles: user.roles || []
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Get user posts
// router.get('/posts/:userId', async (req, res) => {
//     try {
//         const posts = await Post.find({ 'user._id': req.params.userId })
//             .sort({ creation_time_ms: -1 });

//         res.json({
//             success: true,
//             posts: posts
//         });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// });

// Upload profile image
router.post('/profile/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: 'No image provided' });
        }

        // Here you would typically upload the image to a cloud storage service
        // and get back a URL. For this example, we'll use a placeholder URL
        const imageUrl = `http://your-server.com/uploads/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.body.userId,
            { $set: { imageUri: imageUrl } },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            userData: {
                email: user.email,
                name: user.displayName,
                postinIIIT: user.post,
                imageUri: user.imageUri,
                status: user.status,
                roles: user.roles || []
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

module.exports = router;