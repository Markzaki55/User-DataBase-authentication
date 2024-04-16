const jwt = require('jsonwebtoken');
const User = require('../models/User');


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
exports.authorizeAdmin = authorizeAdmin;
