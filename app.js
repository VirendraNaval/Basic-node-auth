// Importing required modules
const express = require("express"); // Express framework for building web applications
const app = express(); // Creating an instance of Express

const userModel = require("./models/user"); // Importing the user model for database operations

const cookieparser = require("cookie-parser"); // Middleware for parsing cookies
const path = require("path"); // Module for handling file and directory paths

const bcrypt = require("bcrypt"); // Library for hashing passwords
const jwt = require("jsonwebtoken"); // Library for generating and verifying JSON Web Tokens (JWT)

// Setting up middleware and configurations
app.set("view engine", "ejs"); // Setting EJS as the template engine
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({extended: true})); // Middleware to parse URL-encoded request bodies
app.use(express.static(path.join(__dirname,"public"))); // Serving static files from the "public" directory
app.use(cookieparser()); // Middleware to parse cookies

// Route: GET "/"
// Renders the index page
app.get("/",(req,res) => {
    res.render("index");
});

// Route: POST "/create"
// Handles user registration
app.post("/create", (req,res) => {
    let {username, email, password, age} = req.body; // Extracting user details from the request body
    bcrypt.genSalt(10, (err, salt) => { // Generating a salt for hashing the password
        bcrypt.hash(password, salt, async (err, hash) => { // Hashing the password
            let createdUser = await userModel.create({ // Creating a new user in the database
                username, 
                email, 
                password: hash, // Storing the hashed password
                age
            });

            let token = jwt.sign({email}, "shhhhh"); // Generating a JWT token with the user's email
            res.cookie("token", token); // Storing the token in a cookie
            res.send(createdUser); // Sending the created user as a response
        });
    });
});

// Route: GET "/logout"
// Handles user logout by clearing the authentication token
app.get("/logout",(req,res) => {
    res.clearCookie("token", ""); // Clearing the "token" cookie
    res.redirect("/"); // Redirecting to the home page
});

// Route: GET "/login"
// Renders the login page
app.get("/login",(req,res) => {
    res.render("login");
});

// Route: POST "/login"
// Handles user login
app.post("/login", async (req,res) => {
    let user = await userModel.findOne({email: req.body.email}); // Finding the user by email in the database
    if(!user) return res.send("something went wrong 1"); // If user not found, send an error message

    bcrypt.compare(req.body.password, user.password, (err, result) => { // Comparing the provided password with the stored hashed password
        if(result) { // If passwords match
            let token = jwt.sign({email: user.email}, "shhhhh"); // Generate a JWT token
            res.cookie("token", token); // Store the token in a cookie
            return res.send("login successfull"); // Send a success message
        }
        else return res.send("something went wrong 2"); // If passwords don't match, send an error message
    });
});

// Starting the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
