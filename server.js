// Import necessary modules and initialize Express app
const express = require("express");
const app = express();

// Import authentication and session management modules
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Import database connection setup and route handlers
const connectDB = require("./config/database");
const homeRoutes = require("./routes/home");
const editRoutes = require("./routes/edit");
const commentRoutes = require("./routes/comment");
const profileRoutes = require("./routes/profile");

// Load environment variables from .env file
require("dotenv").config({ path: "./config/.env" });

// Passport configuration for authentication
require("./config/passport")(passport);

// Set trust proxy to true when hosting behind a reverse proxy (e.g., Render)
app.set("trust proxy", true);

// Define the server port number
const PORT = 8500;

//Initialize database connection
connectDB();

//Middleware setup
//set EJS as the view engine for template rendering
app.set("view engine", "ejs");

//Serve static files from the 'public' folder
app.use(express.static("public"));

// Configure session middleware with MongoDB store for session persistence
// This helps in storing session data in MongoDB using connect-mongo
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_CONNECTION,
    }),
  })
);

//Initialize Passport middleware for authentication
app.use(passport.initialize());
app.use(passport.session());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

//Route definitions. Map URL paths to route handlers
app.use("/", homeRoutes);
app.use("/auth", require("./routes/auth"));
app.use("/edit", editRoutes);
app.use("/comment", commentRoutes);
app.use("/profile", profileRoutes);

//Server Initialization
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
