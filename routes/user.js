const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verify, verifyAdmin } = require('../auth'); 

// Register a new user
router.post('/register', userController.registerUser);

// Login a user
router.post('/login', userController.loginUser);

// Get user details (protected route)
router.get('/user', verify, userController.getUserDetails);

// Additional routes for user management can be added here...

module.exports = router;

