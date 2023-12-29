const mongoose = require("mongoose");
const User = require("./User");

const itemListSchema = new mongoose.Schema({
  titleinput: {
    type: String,
    required: true,
    maxlength: 280,
  },
  textinput: {
    type: String,
    maxlength: 40000,
  },
  linkinput: {
    type: String,
    required: true,
    maxlength: 2100,
  },
  numinput: {
    type: Number,
    required: true,
  },
  regioninput: {
    type: [String],
  },
  countryinput: {
    type: [String],
  },
  healthriskinput: {
    type: [String],
  },
  citationinput: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  // },
  likes: {
    type: Number,
    required: true,
  },
  likedBy: {
    type: Array,
  },
  comments: {
    type: Number,
    required: true,
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
module.exports = mongoose.model("ItemList", itemListSchema, "items");
