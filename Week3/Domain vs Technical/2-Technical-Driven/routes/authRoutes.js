// Routes - Authentication Routes
const express = require('express');
const router = express.Router();
const { validateRegistration, validateLogin } = require('../middlewares/validationMiddleware');

module.exports = (authController) => {
    // POST /api/auth/register
    router.post('/register', validateRegistration, (req, res) => 
        authController.register(req, res)
    );

    // POST /api/auth/login
    router.post('/login', validateLogin, (req, res) => 
        authController.login(req, res)
    );

    return router;
};
