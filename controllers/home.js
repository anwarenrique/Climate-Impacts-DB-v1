const ItemList = require("../models/ItemList");
const User = require("../models/User");

module.exports = {
  getLogin: async (req, res) => {
    try {
      const items = await res.render("login.ejs");
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  getIndex: async (req, res) => {
    try {
      const items = await ItemList.find();
      res.render("index.ejs", { itemList: items });
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  getDashboard: async (req, res) => {
    try {
      const items = await ItemList.find();
      res.render("dashboard.ejs", { itemList: items });
    } catch (err) {
      res.render("error/500");
      if (err) return res.status(500).send(err);
    }
  },
  createItem: async (req, res) => {
    const newItem = new ItemList({
      titleinput: req.body.titleinput,
      textinput: req.body.textinput,
      linkinput: req.body.linkinput,
      numinput: req.body.numinput,
      regioninput: req.body.regioninput,
      countryinput: req.body.countryinput,
      healthriskinput: req.body.healthriskinput,
      citationinput: req.body.citationinput,
      postedBy: User.displayName,
      likes: 0,
      // User: req.body.User,
    });
    try {
      await newItem.save();
      console.log(newItem);
      res.redirect("/");
    } catch (err) {
      if (err) return res.status(500).send(err);
      res.redirect("/dashboard");
    }
  },
  getGuestDashboard: async (req, res) => {
    try {
      const items = await ItemList.find();
      res.render("guestDashboard.ejs", { itemList: items });
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  likePost: async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    try {
      const post = await ItemList.findById(postId);
      if (!post) {
        console.log("Post not found.");
        res.redirect("/dashboard");
        return;
      }

      const likedByUser = post.likedBy.includes(userId);

      if (likedByUser) {
        await ItemList.findByIdAndUpdate(postId, {
          $inc: { likes: -1 },
          $pull: { likedBy: userId },
        });
        console.log("Post unliked.");
      } else {
        await ItemList.findByIdAndUpdate(postId, {
          $inc: { likes: 1 },
          $push: { likedBy: userId },
        });
        console.log("Post liked.");
      }

      res.redirect("/dashboard");
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
};
