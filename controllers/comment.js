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
};
