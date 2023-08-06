//*Handles initial GET request for the homepage
//*Handles POST method  request for adding a new item
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get("/:id", ensureAuth, profileController.getProfile); //read

module.exports = router;
