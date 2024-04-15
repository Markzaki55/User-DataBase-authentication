const fs = require('fs');
const crypto = require('crypto');

// Generate a random 32-byte secret key and convert it to a hex string
const secretKey = crypto.randomBytes(32).toString('hex');

console.log('Generated Secret Key:', secretKey);

// Path to the .env file
const envFilePath = './.env';

// Add or update the JWT_SECRET in the .env file
const envContent = `JWT_SECRET=${secretKey}\n`;

// Write the content to the .env file
fs.writeFile(envFilePath, envContent, { flag: 'a' }, (err) => {
    if (err) {
        console.error('Error writing to .env file:', err);
    } else {
        console.log('Secret key saved to .env file');
    }
});
