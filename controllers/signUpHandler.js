const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Joi schemas for request validation
const signUpSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('user', 'admin').required(),
    act: Joi.string().valid('vampire', 'werewolf', 'siren', 'human').required(),
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
exports.signUpHandler = signUpHandler;
