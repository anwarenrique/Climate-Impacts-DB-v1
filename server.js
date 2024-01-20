//todo - Declare Variables and import necessary modules and routes
const express = require("express");
const app = express();

//Set trust proxy
app.set("trust proxy", true);

const PORT = 8500;
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");

//*Import functions/routes
const connectDB = require("./config/database");
const homeRoutes = require("./routes/home");
const editRoutes = require("./routes/edit");
const commentRoutes = require("./routes/comment");
const profileRoutes = require("./routes/profile");

require("dotenv").config({ path: "./config/.env" });

//Pasport config
require("./config/passport")(passport);

//todo - Connect to Database
connectDB();

//todo - Set Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));

//Sessions. It creates a session store using MongoStore with the provided mongoUrl for storing session data.
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

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//*Required to properly parse form POST requests - sending data
app.use(express.urlencoded({ extended: true }));

//todo - Set Routes
app.use("/", homeRoutes);
app.use("/auth", require("./routes/auth"));
app.use("/edit", editRoutes);
app.use("/comment", commentRoutes);
app.use("/profile", profileRoutes);

//todo - Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
