const ItemList = require("../models/ItemList");
const User = require("../models/User");
const Comment = require("../models/Comment");

module.exports = {
  getProfile: async (req, res) => {
    try {
      // Fundamental states (req.params)
      const view = req.params.view || "dashboard";
      const profileId = req.params.id;

      //Guest or logged in user (req.user)
      let user = req.user;
      if (!req.user) {
        user = {
          _id: "guest",
          likedPosts: [],
          savedPosts: [],
        };
      }

      // Optional states (req.query)
      const {
        page = 1,
        sort = "defaultSort",
        regionfilter,
        countryfilter,
        healthriskfilter,
      } = req.query;

      //Retrieve the profile document to get postCount and commentCount
      const profile = await User.findById(profileId);

      // Helper function to process filters
      const processFilter = (filter) => {
        if (Array.isArray(filter)) {
          return filter
            .map((item) => item.split(",").map((subItem) => subItem.trim()))
            .flat();
        }
        return filter.split(",").map((subItem) => subItem.trim());
      };

      let filterParameters = [];

      // Process filters
      if (regionfilter) filterParameters.push(...processFilter(regionfilter));
      if (countryfilter) filterParameters.push(...processFilter(countryfilter));
      if (healthriskfilter)
        filterParameters.push(...processFilter(healthriskfilter));

      const uniqueItems = [...new Set(filterParameters)];
      // Maintain filterParameters as an array
      filterParameters = [...uniqueItems];

      // Fetch the posts posted by the user indicated in the router
      let query = await ItemList.find({
        postedBy: profileId, // Only select items posted by the specified user
      }).populate("postedBy");

      res.render("profile.ejs", {
        itemList: items,
        user,
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
  editProfileLink: async (req, res) => {
    const userId = req.user.id;
    const newProfileLink = req.body.newProfileLink;
    try {
      await User.findByIdAndUpdate(userId, {
        profileLink: newProfileLink,
      });
      return res.redirect("/profile/" + userId);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },
  editProfileBio: async (req, res) => {
    const userId = req.user.id;
    const newProfileBio = req.body.newProfileBio;
    try {
      await User.findByIdAndUpdate(userId, {
        profileBio: newProfileBio,
      });
      return res.redirect("/profile/" + userId);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },
  editUserProfile: async (req, res) => {
    const userId = req.user.id;
    const { newDisplayName, newProfileLink, newProfileBio } = req.body;
    try {
      await User.findByIdAndUpdate(userId, {
        displayName: newDisplayName,
        profileLink: newProfileLink,
        profileBio: newProfileBio,
      });
      return res.redirect("/feed/profile/" + userId);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },
};
