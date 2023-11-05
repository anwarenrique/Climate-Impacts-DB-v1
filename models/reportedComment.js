const mongoose = require("mongoose");

const ReportedComment = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
    maxlength: 280,
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
module.exports = mongoose.model(
  "ReportedComment",
  ReportedComment,
  "reportedComments"
);
