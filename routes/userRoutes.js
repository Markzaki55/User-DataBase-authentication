

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

dotenv.config();

// Import models
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const authenticate = require('../middlewares/authenticate');

async function authorizeAdmin(req, res, next) {
    try {
        // Retrieve the token from the request headers
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authorization header missing or incorrect' });
        }

        // Decode the token to get the user ID
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Query the database to retrieve the user's information
        const user = await User.findById(userId);
        
        // If the user does not exist, respond with a 404 Not Found error
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user's role is 'admin'
        if (user.role !== 'admin') {
            return res.status(403).json({ error: `Forbidden: You do not have admin privileges (role: ${user.role})` });
        }

        // If the user is an admin, proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error authorizing admin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// setting limits
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
});

router.use(limiter);

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    // Log error with Winston or console.error
    winston.error(`Error: ${err.message}`);

    // Send appropriate HTTP status and error message
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
};

// Add the error handler as the last middleware
router.use(errorHandler);


// Joi schemas for request validation
const signUpSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('user', 'admin').required(),
    act: Joi.string().valid('vampire', 'werewolf', 'siren', 'human').required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

// Sign up route handler
const signUpHandler = async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = signUpSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, email, password, role, act } = value;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            hashedPassword, // Use consistent variable naming
            role,
            act,
        });

        // Save new user
        await newUser.save();

        // Log the activity
        const newActivityLog = new ActivityLog({
            action: 'User signed up',
            userId: newUser._id,
            details: `User ${newUser.name} signed up with email ${newUser.email}`,
        });
        await newActivityLog.save();

        // Respond with user data
        res.status(201).json({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            act: newUser.act,
        });

        
    res.redirect('/api/signin');
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
   
};

// Login route handler
const loginHandler = async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email, password } = value;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create a JWT token with the user's ID
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        // Log the activity
        const newActivityLog = new ActivityLog({
            action: 'User logged in',
            userId: user._id,
            details: `User ${user.name} logged in with email ${user.email}`,
        });
        await newActivityLog.save();

        // Respond with the token
        res.json({ token });
        res.redirect('/api/mainpage');
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
    
 
};
const getDashboardData = async (req, res, next) => {
    try {
        // Fetch user count
        const usersCount = await User.countDocuments();

        // Fetch active users count
        const activeUsersCount = await User.countDocuments({ act: true });

        // Fetch recent activities (e.g., the 10 most recent)
        const recentActivities = await ActivityLog.find()
            .sort({ timestamp: -1 }) // Sort by latest activities
            .limit(10) // Limit to the 10 most recent activities
            .exec();

        // Fetch user role breakdown
        const userRolesBreakdown = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
        ]);

        // Construct response data
        const dashboardData = {
            usersCount,
            activeUsersCount,
            recentActivities,
            userRolesBreakdown,
        };

        // Render the EJS template and pass data to it
        res.render('dashboard', { data: dashboardData });
    } catch (error) {
        console.error('Error fetching data for admin dashboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// Define routes
router.post('/SignUp', signUpHandler);
router.post('/signin', loginHandler);
router.get('/dashboard', authenticate, authorizeAdmin, getDashboardData);


// Route for displaying the signup form
router.get('/signup', (req, res) => {
    res.render('signup');
});

// Route for displaying the signin form
router.get('/signin', (req, res) => {
    res.render('signin');
});
// Route for displaying the main page
router.get('/mainpage', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.render('mainpage', {
            username: user.name,
            act: user.act,
            isAdmin: user.role === 'admin'
        });
    } catch (error) {
        console.error('Error retrieving user for main page:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
