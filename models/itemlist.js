const mongoose = require("mongoose");
const User = require("./User");
const itemListSchema = new mongoose.Schema({
  titleinput: {
    type: String,
    required: true,
  },
  textinput: {
    type: String,
    required: true,
  },
  linkinput: {
    type: String,
    required: true,
  },
  numinput: {
    type: Number,
    required: true,
  },
  regioninput: {
    type: String,
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
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // postedBy: {
  //   type: String,
  //   ref: "User.displayName",
  // },
});
module.exports = mongoose.model("ItemList", itemListSchema, "items");
