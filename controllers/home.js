const ItemList = require("../models/ItemList");
const User = require("../models/User");
const Comment = require("../models/Comment");

let filteredItems = []; //declare this variable that will store filtered results

module.exports = {
  getLogin: async (req, res) => {
    try {
      const items = await res.render("login.ejs");
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  getDashboard: async (req, res) => {
    try {
      const items = await ItemList.find().populate("postedBy");

      res.render("dashboard.ejs", { itemList: items, user: req.user });
    } catch (err) {
      res.render("error/500");
      if (err) return res.status(500).send(err);
    }
  },
  getNewPost: async (req, res) => {
    try {
      const items = await ItemList.find().populate("postedBy");
      res.render("newPost.ejs", { itemList: items });
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
      postedBy: req.user.id,
      likes: 0,
      comments: 0,
      // User: req.body.User,
    });
    try {
      await newItem.save();
      // Update the user's postCount
      await User.findByIdAndUpdate(req.user.id, { $inc: { postCount: 1 } });

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

        // Remove the postId from the user's likedPosts array
        await User.findByIdAndUpdate(userId, {
          $pull: { likedPosts: postId },
        });

        console.log("Post unliked.");
      } else {
        await ItemList.findByIdAndUpdate(postId, {
          $inc: { likes: 1 },
          $push: { likedBy: userId },
        });

        // Add the postId to the user's likedPosts array
        await User.findByIdAndUpdate(userId, {
          $push: { likedPosts: postId },
        });
        console.log("Post liked.");
      }

      res.redirect("/dashboard");
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  savePost: async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    try {
      // Find the user document
      const user = await User.findById(userId);

      // Check if the post is already saved by the user
      const postIndex = user.savedPosts.indexOf(postId);
      if (postIndex !== -1) {
        // If the post is already saved, remove it from the savedPosts array
        user.savedPosts.splice(postIndex, 1);
      } else {
        // If the post is not saved, add it to the savedPosts array
        user.savedPosts.push(postId);
      }

      // Save the updated user document
      await user.save();

      // Redirect back to the original post or a specific page, as desired
      res.redirect("/dashboard");
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  getFilteredItems: async (req, res) => {
    try {
      const { regionfilter, countryfilter, healthriskfilter } = req.query;

      let query = ItemList.find();

      // Apply filters
      if (regionfilter) {
        console.log("regioninput");
        query = query
          .where("regioninput")
          .in(["The Americas (all subregions)", regionfilter])
          .sort({
            regioninput:
              regionfilter === "The Americas (all subregions)" ? -1 : 1,
          });
      }
      if (countryfilter) {
        query = query
          .where("countryinput")
          .in(["All countries", countryfilter])
          .sort({ countryinput: countryfilter === "All countries" ? 1 : -1 });
      }

      if (healthriskfilter) {
        query = query.where("healthriskinput").in(healthriskfilter);
      }

      const itemList = await query.exec();
      console.log("filter");
      res.render("dashboard.ejs", { itemList, user: req.user });
      filteredItems = itemList; // Store the filtered results
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },
  getSortedItems: async (req, res) => {
    try {
      const { sort } = req.query;

      let query = ItemList.find();

      if (filteredItems.length > 0) {
        query = query.where("_id").in(filteredItems.map((item) => item._id));
      }

      //Apply sorting
      if (sort) {
        switch (sort) {
          case "yearDecreasing":
            query = query.sort({ numinput: -1 });
            break;
          case "yearIncreasing":
            query = query.sort({ numinput: 1 });
            break;
          case "createdAtDecreasing":
            query = query.sort({ createdAt: -1 });
            break;
          case "createdAtIncreasing":
            query = query.sort({ createdAt: 1 });
            break;
          case "likes":
            query = query.sort({ likes: -1 });
            break;
        }
      }

      const itemList = await query.exec();
      console.log("sort");
      res.render("dashboard.ejs", { itemList, user: req.user });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },
  clearFilter: async (req, res) => {
    try {
      // Reset the filteredItems to an empty array
      filteredItems = [];

      // Redirect or render the desired view after clearing the filter
      res.redirect("/dashboard"); // Example: Redirect to the dashboard page
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },
  getViewPost: async (req, res) => {
    try {
      const itemId = req.params.id;
      const item = await ItemList.findById(itemId).populate("postedBy");
      const comments = await Comment.find({ post: itemId })
        .populate("postedBy")
        .sort({ createdAt: "desc" })
        .lean();

      if (!item) {
        // Item not found
        return res.status(404).render("error/404");
      }

      res.render("viewPost.ejs", { item, comments: comments, user: req.user });
    } catch (err) {
      console.error(err);
      res.status(500).render("error/500");
    }
  },
  getLikedPosts: async (req, res) => {
    try {
      const userId = req.user.id;
      // Retrieve the user document to get the likedPosts array
      const user = await User.findById(userId);
      // Fetch the posts that have their _id in the likedPosts array of the user
      const items = await ItemList.find({
        _id: { $in: user.likedPosts },
      }).populate("postedBy");

      res.render("likedPosts.ejs", { itemList: items, user: req.user });
    } catch (err) {
      res.render("error/500");
      if (err) return res.status(500).send(err);
    }
  },
  getSavedPosts: async (req, res) => {
    try {
      const userId = req.user.id;
      // Retrieve the user document to get the likedPosts array
      const user = await User.findById(userId);
      // Fetch the posts that have their _id in the likedPosts array of the user
      const items = await ItemList.find({
        _id: { $in: user.savedPosts },
      }).populate("postedBy");

      res.render("savedPosts.ejs", { itemList: items, user: req.user });
    } catch (err) {
      res.render("error/500");
      if (err) return res.status(500).send(err);
    }
  },
};
