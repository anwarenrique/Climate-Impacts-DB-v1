const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
    maxlength: 4000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  likes: {
    type: Number,
    required: true,
  },
  likedBy: {
    type: Array,
  },
  reportCount: {
    type: Number,
    default: 0,
  },
  reportedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
});
module.exports = mongoose.model("Comment", CommentSchema);
