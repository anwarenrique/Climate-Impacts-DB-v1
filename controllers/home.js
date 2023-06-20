const ItemList = require("../models/ItemList");
const User = require("../models/User");

let filteredItems = []; //declare this variable that will store filtered results

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
      const items = await ItemList.find().populate("postedBy");
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
      postedBy: req.user.id,
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
      res.render("dashboard.ejs", { itemList });
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
      res.render("dashboard.ejs", { itemList });
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
};
