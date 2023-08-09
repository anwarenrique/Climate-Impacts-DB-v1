//*Handles initial GET request for the homepage
//*Handles POST method  request for adding a new item

const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get("/", ensureGuest, homeController.getLogin); //read
router.post("/new", ensureAuth, homeController.createItem); //Add post to database
router.get("/newPost", ensureAuth, homeController.getNewPost); //go to the 'write post' view
router.get("/dashboard", ensureAuth, homeController.getDashboard); //go to the main feed for (logged in users)
router.get("/guestDashboard", homeController.getGuestDashboard); //go to main feed (for non logged in users)
router.get("/likePost/:id", ensureAuth, homeController.likePost); //like a post
router.get("/savePost/:id", ensureAuth, homeController.savePost); //save a post
router.get("/getFilteredItems/:view/:id", homeController.getFilteredItems); //filter
router.get("/getSortedItems/:view/:id", homeController.getSortedItems); //sort
router.get("/clearFilter/:view/:id", homeController.clearFilter); //clear the filter you set
router.get("/viewPost/:view/:id", homeController.getViewPost); //view single post in detail
router.get("/likedPosts", ensureAuth, homeController.getLikedPosts); //view page with posts you have liked
router.get("/savedPosts", ensureAuth, homeController.getSavedPosts); //view page with posts you have saved

module.exports = router;
