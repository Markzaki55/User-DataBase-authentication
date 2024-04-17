const jwt = require('jsonwebtoken');
const User = require('../models/User');


async function authorizeAdmin(req, res, next) {
    try {
        // Retrieve the token from the request headers
       // Try to get the token from the Authorization header
    let token = req.headers.authorization?.split(' ')[1];

    // If the token is not found in the header, check the cookies
    if (!token) {
        token = req.cookies?.auth_token; // Assuming the cookie name is 'auth_token'
    }

    // If the token is still not found, return an error
    if (!token) {
        return res.status(401).json({ error: 'Authorization header or cookie missing or incorrect' });
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
