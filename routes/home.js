//*Handles initial GET request for the homepage
//*Handles POST method  request for adding a new item

const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

// router.get('/', homeController.getIndex) //read
router.get("/", ensureGuest, homeController.getLogin); //read
router.post("/new", ensureAuth, homeController.createItem); //create
router.get("/newPost", ensureAuth, homeController.getNewPost);
router.get("/dashboard", ensureAuth, homeController.getDashboard);
router.get("/guestdashboard", homeController.getGuestDashboard);
router.get("/likePost/:id", ensureAuth, homeController.likePost);
router.get("/getFilteredItems", ensureAuth, homeController.getFilteredItems);
router.get("/getSortedItems", ensureAuth, homeController.getSortedItems);
router.get("/clearFilter", ensureAuth, homeController.clearFilter);

module.exports = router;
