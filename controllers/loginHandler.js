const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});
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
            return res.status(401).json({ error: 'Invalid password' });
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
      //  res.json({ token });
      res.cookie('auth_token', token, {
        httpOnly: true, // Makes it inaccessible to JavaScript (prevents XSS)
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 3600000, // Token expiration (1 hour)
    });

        res.redirect('/api/mainpage')

    } catch (error) {
        next(error); // Pass error to error handling middleware
    }


};
exports.loginHandler = loginHandler;
