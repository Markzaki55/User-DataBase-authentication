

const express = require('express');
const router = express.Router();
exports.router = router;
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

// Import models
const User = require('../models/User');
const authenticate = require('../middlewares/authenticate');
const { authorizeAdmin } = require('../middlewares/authorizeAdmin');
const { errorHandler } = require('../errorHandler');
const { signUpHandler } = require('../controllers/signUpHandler');
const { loginHandler } = require('../controllers/loginHandler');
const { getDashboardData } = require('../controllers/getDashboardData');


// setting limits
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
});

router.use(limiter);


// Define routes
router.post('/SignUp',errorHandler, signUpHandler);
router.post('/signin',errorHandler, loginHandler);
router.get('/dashboard', authenticate, authorizeAdmin, errorHandler ,getDashboardData);


// Route for displaying the signup form
router.get('/signup', (req, res) => {
    res.render('signup');
});

// Route for displaying the signin form
router.get('/signin', (req, res) => {
    res.render('signin');
});
// Route for displaying the main page
router.get('/mainpage', authenticate , async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.render('mainpage', {
            username: user.name,
            act: user.act,
            isAdmin: user.role === 'admin',
            _authtoken : token,
            
        });
    } catch (error) {
        console.error('Error retrieving user for main page:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

