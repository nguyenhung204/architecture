// Routes - User Routes
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

module.exports = (userController) => {
    // GET /api/users/profile - Get user profile
    router.get('/profile', authMiddleware, (req, res) => 
        userController.getProfile(req, res)
    );

    // PUT /api/users/profile - Update user profile
    router.put('/profile', authMiddleware, (req, res) => 
        userController.updateProfile(req, res)
    );

    // DELETE /api/users/profile - Delete user account
    router.delete('/profile', authMiddleware, (req, res) => 
        userController.deleteProfile(req, res)
    );

    return router;
};
