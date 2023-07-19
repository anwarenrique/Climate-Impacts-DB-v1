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
};
