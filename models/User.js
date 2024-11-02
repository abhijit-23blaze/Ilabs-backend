const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        // Required only for email/password authentication
    },
    post: {
        type: String,
        required: true
    },
    imageUri: {
        type: String,
        default: "https://bit.ly/3T5Uk5W"
    },
    status: {
        type: String,
        default: "Hey There I'm Using this Application"
    },
    googleId: {
        type: String,
        // Only for Google Sign-in users
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);