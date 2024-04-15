const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authorization header missing or incorrect' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                // Token is expired, inform the user
                return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
            } else {
                // Other errors, such as invalid token
                console.log('Token verification failed:', err.message);
                return res.status(401).json({ error: 'Invalid token' });
            }
        }

        // Log the decoded token
        console.log('Token verified:', decoded);
        

        req.user = decoded; // Attach the user data from the token to the request
        next();
    });
}

module.exports = authenticate;
