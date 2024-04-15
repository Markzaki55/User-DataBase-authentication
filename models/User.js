const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define User schema
const UserSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true // Ensure emails are unique
    },
    hashedPassword: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Specifies possible roles
        default: 'user' // Default role is 'user'
    },
    act: {
        type: String,
        enum: ['vampire', 'werewolf', 'siren', 'human'], // Specifies possible acts
        default: 'human' // Default act is 'human'
    }
});

// Create the User model using the schema
const User = mongoose.model('User', UserSchema);

// Export the User model
module.exports = User;
