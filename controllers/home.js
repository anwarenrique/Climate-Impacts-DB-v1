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
    const id = req.params.id;
    try {
      await ItemList.findOneAndUpdate(
        { _id: id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");

      res.redirect("/dashboard");
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
};
