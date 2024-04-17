

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes'); // Import the user routes


// Initialize Express app
const app = express();
const PORT = 3000;



// Middleware
app.use(bodyParser.json()); // For JSON payloads
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true })); // For URL-encoded payloads
app.set('view engine', 'ejs');
app.set('views');
app.use(cookieParser());



// Connect to MongoDB database

mongoose.connect("mongodb+srv://username:password@cluster0.2ptezno.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>{

    console.log("connection sucssed ");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    })
.catch((error)=>{

    console.log("connection failed",error)
})


app.use('/api',userRoutes);
   


// Use the user routes




