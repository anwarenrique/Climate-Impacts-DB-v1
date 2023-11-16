//*Handles initial GET request for the homepage
//*Handles POST method  request for adding a new item
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

// router.get("/:id", profileController.getProfile); //read
router.get("/guestDashboard/:id", profileController.getGuestProfile); //read
router.get("/getEditProfile/:id", ensureAuth, profileController.getEditProfile); //access the edit profile page
router.post(
  "/editDisplayName/:id",
  ensureAuth,
  profileController.editDisplayName
); //edit the display name
router.post(
  "/editProfileLink/:id",
  ensureAuth,
  profileController.editProfileLink
); //edit the display name
router.post(
  "/editProfileBio/:id",
  ensureAuth,
  profileController.editProfileBio
); //edit the display name

module.exports = router;
