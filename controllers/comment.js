const ItemList = require("../models/ItemList");
const User = require("../models/User");
const Comment = require("../models/Comment");
const ReportedComment = require("../models/reportedComment");

const moveCommentToReportedCollection = async (comment) => {
  const reportedComment = new ReportedComment(comment.toObject());

  try {
    // Save the reported post to the "reportedposts" collection
    await reportedComment.save();

    // Remove the post from the regular post collection
    await Comment.findByIdAndDelete(comment._id);

    console.log(
      `Comment with ID ${comment._id} moved to reportedposts collection.`
    );
  } catch (error) {
    console.error(error);
  }
};

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

      // Update the user's commentCount
      await User.findByIdAndUpdate(req.user.id, { $inc: { commentCount: 1 } });

      console.log(newComment);
      res.redirect("/viewPost/dashboard/" + req.params.id);
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
      res.redirect("/viewPost/dashboard/" + postId);
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
        comments: comments,
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
      res.redirect("/viewPost/dashboard/" + Postid);
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
      await ItemList.updateOne({ _id: Postid }, { $inc: { comments: -1 } });

      // Update the user's commentCount
      await User.findByIdAndUpdate(userId, { $inc: { commentCount: -1 } });

      console.log(result);
      res.redirect("/viewPost/dashboard/" + Postid);
    } catch (err) {
      console.error(err);
      res.status(500).render("error/500");
    }
  },
  reportComment: async (req, res) => {
    const Commentid = req.params.Commentid;
    const Postid = req.params.Postid;
    const userId = req.user.id;
    try {
      // Find the post by ID
      const comment = await Comment.findById(Commentid);

      if (!comment) {
        return res.status(404).render("error/404");
      }

      if (comment.reportedBy.includes(userId)) {
        // User has already reported this post
        return res.status(400).send("You've already reported this comment.");
      }

      // Add the user's ID to the reportedBy array
      comment.reportedBy.push(userId);

      // Increment the report count
      comment.reportCount++;

      await comment.save();

      if (comment.reportCount >= 2) {
        // Call a function to move the post to a new collection
        moveCommentToReportedCollection(comment);
      }

      res.redirect("back");
    } catch (error) {
      console.error(error);
      res.status(500).render("error/500");
      console.log(`failed to report comment ${Commentid}`);
    }
  },
};
