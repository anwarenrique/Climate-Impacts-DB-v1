const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile");
const { ensureAuth } = require("../middleware/auth");

//Router to Update user displayName, Bio, or featured Link
router.post(
  "/editUserProfile/:id",
  ensureAuth,
  profileController.editUserProfile
);
module.exports = router;
