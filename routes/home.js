//*Handles initial GET request for the homepage
//*Handles POST method  request for adding a new item

const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get("/", ensureGuest, homeController.getUnifiedDashboard); //read
router.post("/new", ensureAuth, homeController.createItem); //Add post to database
router.get("/newPost", ensureAuth, homeController.getNewPost); //go to the 'write post' view
router.get("/about", homeController.getAbout); //go to about page
router.get("/feed/:view?/:id?", homeController.getUnifiedDashboard); //render main dashboard view, includes viewing profiles
router.get("/likePost/:id", ensureAuth, homeController.likePost); //like a post
router.get("/savePost/:id", ensureAuth, homeController.savePost); //save a post
router.get("/clearFilter/:view/:id", homeController.clearFilter); //clear the filter you set
router.get("/viewPost/:view?/:id?", homeController.getViewPost); //view single post in detail
router.get("/likedPosts", ensureAuth, homeController.getLikedPosts); //view page with posts you have liked
router.get("/savedPosts", ensureAuth, homeController.getSavedPosts); //view page with posts you have saved
router.get("/reportPost/:id", ensureAuth, homeController.reportPost); //reports a post
router.get("/formError?:error", homeController.getFormError); //render error page if post is submitted incorrectly

module.exports = router;
