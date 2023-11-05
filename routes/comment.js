//*Handles all comments. including post request for adding new comments under a post

const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.post("/createComment/:id", ensureAuth, commentController.createComment); //post a comment
router.get(
  "/likeComment/:Postid/comments/:Commentid",
  ensureAuth,
  commentController.likeComment
); //like a post
router.get(
  "/editComment/:Postid/comments/:Commentid",
  ensureAuth,
  commentController.getEditComment
); //go to edit comment view
router.post(
  "/updateComment/:Postid/comments/:Commentid",
  ensureAuth,
  commentController.updateComment
); //update comment
router.get(
  "/deleteComment/:Postid/comments/:Commentid",
  ensureAuth,
  commentController.deleteComment
); //delete comment
router.get(
  "/reportComment/:Postid?/comments/:Commentid?",
  ensureAuth,
  commentController.reportComment
); //report a comment

module.exports = router;
