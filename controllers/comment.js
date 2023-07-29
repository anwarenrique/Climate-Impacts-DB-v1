const ItemList = require("../models/ItemList");
const User = require("../models/User");
const Comment = require("../models/Comment");

module.exports = {
  createComment: async (req, res) => {
    const newComment = new Comment({
      comment: req.body.commentinput,
      post: req.params.id,
      postedBy: req.user.id,
      likes: 0,
    });
    try {
      await newComment.save();
      // Update the comments count in the associated ItemList model
      await ItemList.updateOne(
        { _id: req.params.id },
        { $inc: { comments: 1 } }
      );

      console.log(newComment);
      res.redirect("/viewPost/" + req.params.id);
    } catch (err) {
      if (err) return res.status(500).send(err);
      res.redirect("error/500");
    }
  },
  likeComment: async (req, res) => {
    const commentId = req.params.Commentid;
    const postId = req.params.Postid;
    const userId = req.user.id;

    try {
      const post = await Comment.findById(commentId);
      if (!post) {
        console.log("Comment not found.");
        res.redirect("/dashboard");
        return;
      }

      const likedByUser = post.likedBy.includes(userId);

      if (likedByUser) {
        await Comment.findByIdAndUpdate(commentId, {
          $inc: { likes: -1 },
          $pull: { likedBy: userId },
        });
        console.log("Comment unliked.");
      } else {
        await Comment.findByIdAndUpdate(commentId, {
          $inc: { likes: 1 },
          $push: { likedBy: userId },
        });
        console.log("Comment liked.");
      }

      // res.redirect("/dashboard");
      res.redirect("/viewPost/" + postId);
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  getEditComment: async (req, res) => {
    try {
      console.log("viewing edit comment view");
      const Commentid = req.params.Commentid;
      const Postid = req.params.Postid;
      const userId = req.user.id;

      const item = await ItemList.findById(Postid).populate("postedBy");
      const comments = await Comment.find({ post: Postid })
        .populate("postedBy")
        .sort({ createdAt: "desc" })
        .lean();

      if (!item) {
        // Item not found
        return res.status(404).render("error/404");
      }

      res.render("editComment.ejs", {
        item,
        commentsList: comments,
        commentId: Commentid,
        user: req.user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("error/500");
    }
  },
  updateComment: async (req, res) => {
    const Commentid = req.params.Commentid;
    const Postid = req.params.Postid;
    const userId = req.user.id;
    try {
      console.log("update comment");
      await Comment.findByIdAndUpdate(Commentid, {
        comment: req.body.commentinput,
        post: req.params.id,
        postedBy: req.user.id,
      });
      res.redirect("/viewPost/" + Postid);
    } catch (err) {
      console.error(err);
      res.status(500).render("error/500");
    }
  },
  deleteComment: async (req, res) => {
    const Commentid = req.params.Commentid;
    const Postid = req.params.Postid;
    const userId = req.user.id;
    try {
      const result = await Comment.findByIdAndDelete(Commentid);
      console.log(result);
      res.redirect("/viewPost/" + Postid);
    } catch (err) {
      console.error(err);
      res.status(500).render("error/500");
    }
  },
};
