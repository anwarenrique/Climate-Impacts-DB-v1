const ItemList = require("../models/ItemList");
const User = require("../models/User");

module.exports = {
  getEdit: async (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
      const items = await ItemList.find().populate("postedBy");
      res.render("edit.ejs", { itemList: items, idItem: id, user: req.user });
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  deleteItem: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await ItemList.findByIdAndDelete(id);
      // Update the user's postCount
      await User.findByIdAndUpdate(req.user.id, { $inc: { postCount: -1 } });
      console.log(result);
      res.redirect("back");
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  updateItem: async (req, res) => {
    const id = req.params.id;
    try {
      await ItemList.findByIdAndUpdate(id, {
        titleinput: req.body.titleinput,
        textinput: req.body.textinput,
        linkinput: req.body.linkinput,
        numinput: req.body.numinput,
        regioninput: req.body.regioninput,
        countryinput: req.body.countryinput,
        healthriskinput: req.body.healthriskinput,
        citationinput: req.body.citationinput,
      });
      res.redirect("/dashboard");
    } catch (err) {
      if (err) return res.status(500).send(err);
      res.redirect("/dashboard");
    }
  },
};
