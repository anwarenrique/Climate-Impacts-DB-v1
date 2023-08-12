const ItemList = require("../models/ItemList");
const User = require("../models/User");
const Comment = require("../models/Comment");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const profileId = req.params.id;
      const userId = req.user.id;
      // Retrieve the user document to get postCount and commentCount
      const user = await User.findById(userId);
      //Retrieve the profile document to get postCount and commentCount
      const profile = await User.findById(profileId);
      // Fetch the posts posted by the user indicated in the router
      const items = await ItemList.find({
        postedBy: profileId, // Only select items posted by the specified user
      }).populate("postedBy");
      res.render("profile.ejs", {
        itemList: items,
        user: req.user,
        profile: profile,
      });
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  getGuestProfile: async (req, res) => {
    try {
      const profileId = req.params.id;

      //Retrieve the profile document to get postCount and commentCount
      const profile = await User.findById(profileId);
      // Fetch the posts posted by the user indicated in the router
      const items = await ItemList.find({
        postedBy: profileId, // Only select items posted by the specified user
      }).populate("postedBy");
      res.render("GuestProfile.ejs", {
        itemList: items,
        profile: profile,
      });
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  getEditProfile: async (req, res) => {
    try {
      const profileId = req.params.id;
      const userId = req.user.id;

      // Retrieve the user document to get postCount and commentCount
      const user = await User.findById(userId);
      //Retrieve the profile document to get postCount and commentCount
      const profile = await User.findById(profileId);
      res.render("editProfile.ejs", { user: req.user, profile: profile });
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  editDisplayName: async (req, res) => {
    const userId = req.user.id;
    const newDisplayName = req.body.newDisplayName;
    try {
      await User.findByIdAndUpdate(userId, {
        displayName: newDisplayName,
      });
      return res.redirect("/profile/" + userId);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },
};
