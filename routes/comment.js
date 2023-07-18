//*Handles all comments. including post request for adding new comments under a post

const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.post("/createComment/:id", ensureAuth, commentController.createComment); //post a comment

module.exports = router;
