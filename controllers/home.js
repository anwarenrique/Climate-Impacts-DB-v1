const ItemList = require("../models/ItemList");
const User = require("../models/User");
const Comment = require("../models/Comment");
const ReportedPost = require("../models/reportedPost");
const { post } = require("../routes/home");

let filteredItems = []; //declare this variable that will store filtered results
let filterParameters = [];
const ITEMS_PER_PAGE = 5; // Number of items per page

const movePostToReportedCollection = async (post) => {
  const reportedPost = new ReportedPost(post.toObject());

  try {
    // Save the reported post to the "reportedposts" collection
    await reportedPost.save();

    // Remove the post from the regular post collection
    await ItemList.findByIdAndDelete(post._id);

    console.log(`Post with ID ${post._id} moved to reportedposts collection.`);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getLogin: async (req, res) => {
    try {
      const items = await res.render("login.ejs");
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  getUnifiedDashboard: async (req, res) => {
    try {
      // Fundamental states (req.params)
      const view = req.params.view || "dashboard";
      const profileId = req.params.id;

      // Optional states (req.query)
      const {
        page = 1,
        sort = "defaultSort",
        regionfilter,
        countryfilter,
        healthriskfilter,
      } = req.query;

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

      let query = ItemList.find().populate("postedBy");

      // Apply filters to the query
      if (regionfilter) query = query.where("regioninput").in(regionfilter);
      if (countryfilter) query = query.where("countryinput").in(countryfilter);
      if (healthriskfilter)
        query = query.where("healthriskinput").in(healthriskfilter);

      //if regionfilter, countryfilter, or healthriskfilter were applied, copy the filtered query to a variable called filteredItems

      if (regionfilter || countryfilter || healthriskfilter) {
        let cloneQuery = query.clone();
        filteredItems = await cloneQuery.exec();
      }
      console.log("Filtered Items:", filteredItems);

      // View-specific queries
      if (view === "profile") query = query.where("postedBy").equals(profileId);
      if (view === "likedPosts" || view === "savedPosts") {
        const userId = req.user.id;
        const user = await User.findById(userId);
        query = query
          .where("_id")
          .in(view === "likedPosts" ? user.likedPosts : user.savedPosts);
      }

      //If items have been filtered already, maintain those while sorting
      if (filteredItems && filteredItems.length > 0) {
        query = ItemList.find({
          _id: { $in: filteredItems.map((item) => item._id) },
        }).populate("postedBy");
      }

      // Sorting
      if (sort) {
        let sortString = Array.isArray(sort) ? sort.join(",") : sort;
        const sanitizedSort = sortString.startsWith(",")
          ? sortString.slice(1)
          : sortString;
        const sortOptions = {
          yearDecreasing: { numinput: -1 },
          yearIncreasing: { numinput: 1 },
          createdAtDecreasing: { createdAt: -1 },
          createdAtIncreasing: { createdAt: 1 },
          likes: { likes: -1 },
          comments: { comments: -1 },
        };
        query = query.sort(sortOptions[sanitizedSort] || {});
        console.log(`sorting by ${sanitizedSort}`);
      }

      // Pagination
      const totalItems = await ItemList.countDocuments(query.getQuery());

      // Set minimum totalPages and page to 1
      const totalPages = Math.max(Math.ceil(totalItems / ITEMS_PER_PAGE), 1);
      const sanitizedPage = Math.max(page, 1);

      // Check if page number is valid
      if (sanitizedPage > totalPages) {
        return res.redirect(
          `/dashboard?page=${totalPages}&sort=${sort}&regionfilter=${regionfilter}&countryfilter=${countryfilter}&healthriskfilter=${healthriskfilter}`
        );
      }

      const skip = (sanitizedPage - 1) * ITEMS_PER_PAGE;

      query = query.skip(skip).limit(ITEMS_PER_PAGE);

      // Execute Query
      const itemList = await query.exec();
      console.log(`Final Query: ${query}`);

      // Render appropriate view
      const renderData = {
        itemList,
        user: req.user,
        regionfilter,
        countryfilter,
        healthriskfilter,
        filterParameters,
        currentPage: page,
        totalPages,
        totalItems,
        currentSort: sort,
      };

      if (view === "profile") {
        const profile = await User.findById(profileId);
        renderData.profile = profile;
        return res.render("profile.ejs", renderData);
      }

      return res.render(view + ".ejs", renderData);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Server Error");
    }
  },
  getDashboard: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Default to page 1 if no page parameter is provided

      const totalItems = await ItemList.countDocuments();
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

      // Calculate the number of items to skip
      const skip = (page - 1) * ITEMS_PER_PAGE;

      // Assuming sort parameter is in the request query
      const currentSort = req.query.sort || "defaultSort";

      // Fetch items for the current page
      const items = await ItemList.find()
        .skip(skip)
        .limit(ITEMS_PER_PAGE)
        .populate("postedBy");

      res.render("dashboard.ejs", {
        itemList: items,
        user: req.user,
        totalPages: totalPages,
        currentPage: page,
        filterParameters,
        currentSort,
      });
    } catch (err) {
      res.render("error/500");
      if (err) return res.status(500).send(err);
    }
  },
  getNewPost: async (req, res) => {
    try {
      const items = await ItemList.find().populate("postedBy");
      res.render("newPost.ejs", { itemList: items, user: req.user });
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
      const items = await ItemList.find().populate("postedBy");
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

      res.redirect("back");
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
      const page = req.query.page || 1; // Get the current page or default to page 1

      let query = ItemList.find().populate("postedBy");
      const view = req.params.view;
      const profileId = req.params.id;
      let filterParameters = [];
      const currentSort = req.query.sort || "defaultSort";

      // Populate the filterParameters array using region, country, and healthrisk inputs
      if (regionfilter) {
        filterParameters.push(`${regionfilter}`);
      }
      if (countryfilter) {
        filterParameters.push(`${countryfilter}`);
      }
      if (healthriskfilter) {
        filterParameters.push(`${healthriskfilter}`);
      }

      //Flatten the array and remove leading/trailing spaces
      const flatArray = filterParameters
        .map((item) => item.split(",").map((subItem) => subItem.trim()))
        .flat();

      // Remove duplicates
      const uniqueItems = [...new Set(flatArray)];

      // Join items into a single string with commas and spaces
      filterParameters = uniqueItems.join(", ");

      // Apply filters
      if (regionfilter) {
        console.log("regioninput");
        query = query
          .where("regioninput")
          .in(regionfilter)
          .sort({
            regioninput:
              regionfilter === "The Americas (all subregions)" ? -1 : 1,
          });
      }
      if (countryfilter) {
        query = query
          .where("countryinput")
          .in(countryfilter)
          .sort({ countryinput: countryfilter === "All countries" ? 1 : -1 });
      }

      if (healthriskfilter) {
        query = query.where("healthriskinput").in(healthriskfilter);
      }

      if (view == "profile") {
        const userId = req.user.id;
        const user = await User.findById(userId);
        query = query.where("postedBy").equals(profileId);
      } else if (view == "likedPosts") {
        const userId = req.user.id;
        const user = await User.findById(userId);
        // Modify the query to filter liked posts
        query = query.where("_id").in(user.likedPosts);
      } else if (view == "savedPosts") {
        const userId = req.user.id;
        const user = await User.findById(userId);
        // Modify the query to filter liked posts
        query = query.where("_id").in(user.savedPosts);
      }

      // Paginate the results
      const countQuery = query.clone();
      const totalItems = await countQuery.countDocuments();
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      const skip = (page - 1) * ITEMS_PER_PAGE;

      query = query.skip(skip).limit(ITEMS_PER_PAGE);

      const itemList = await query.exec();
      console.log(`filter by ${filterParameters}`);

      //If you started at dashboard, redirect to dashboard

      if (view == "guestDashboard") {
        res.render("guestDashboard.ejs", { itemList });
      } //If you started at dashboard, redirect to dashboard
      else if (view == "dashboard") {
        res.render("dashboard.ejs", {
          itemList,
          user: req.user,
          filterParameters,
          currentPage: page,
          totalPages,
          currentSort,
        });
        //if you started at profile, redirect to profile
      } else if (view == "profile") {
        //Retrieve the profile document to get postCount and commentCount
        const profile = await User.findById(profileId);

        res.render("profile.ejs", {
          itemList,
          user: req.user,
          profile: profile,
        });
      } else if (view == "likedPosts") {
        res.render("likedPosts.ejs", { itemList, user: req.user });
      } else if (view == "savedPosts") {
        res.render("savedPosts.ejs", { itemList, user: req.user });
      }

      // res.render("dashboard.ejs", { itemList, user: req.user });
      filteredItems = itemList; // Store the filtered results
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },
  getSortedItems: async (req, res) => {
    try {
      //Exctracting second item of sort array because Tailwind-Elements gives array of [first item, item selected]
      const sortArray = Array.isArray(req.query.sort)
        ? req.query.sort
        : [req.query.sort];
      const sort = sortArray.find((s) => s !== "") || "defaultSort";
      // ? req.query.sort[1]
      // : req.query.sort;

      const currentSort = req.query.sort || "defaultSort";
      const profileId = req.params.id;
      const view = req.params.view;
      const page = req.query.page || 1; // Get the current page or default to page 1

      if (view != "guestDashboard") {
        // const userId = req.user.id;
        // const user = await User.findById(userId);
      }

      let query = ItemList.find().populate("postedBy");
      if (view == "profile") {
        const userId = req.user.id;
        const user = await User.findById(userId);
        query = query.where("postedBy").equals(profileId);
      } else if (view == "likedPosts") {
        const userId = req.user.id;
        const user = await User.findById(userId);
        // Modify the query to filter liked posts
        query = query.where("_id").in(user.likedPosts);
      } else if (view == "savedPosts") {
        const userId = req.user.id;
        const user = await User.findById(userId);
        // Modify the query to filter saved posts
        query = query.where("_id").in(user.savedPosts);
      }

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
          case "comments":
            query = query.sort({ comments: -1 });
            break;
        }
      }

      // Paginate the results
      const totalItems = await ItemList.countDocuments(query.getQuery());
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

      const skip = (page - 1) * ITEMS_PER_PAGE;
      query = query.skip(skip).limit(ITEMS_PER_PAGE);

      console.log(
        `Page: ${page}, Sort: ${sort}, totalItems: ${totalItems}. totalPages: ${totalPages}, skip:${skip} Query: ${JSON.stringify(
          query.getQuery()
        )}`
      );

      const itemList = await query.exec();
      console.log("sort");
      if (view == "guestDashboard") {
        res.render("guestDashboard.ejs", { itemList });
      }
      if (view == "dashboard") {
        console.log(sort);
        console.log(query.getQuery());
        res.render("dashboard.ejs", {
          itemList,
          user: req.user,
          filterParameters,
          currentPage: page,
          totalPages,
          currentSort,
        });
      } else if (view == "profile") {
        //Retrieve the profile document to get postCount and commentCount
        const profile = await User.findById(profileId);
        res.render("profile.ejs", {
          itemList,
          user: req.user,
          profile: profile,
        });
      } else if (view == "likedPosts") {
        res.render("likedPosts.ejs", { itemList, user: req.user });
      } else if (view == "savedPosts") {
        res.render("savedPosts.ejs", { itemList, user: req.user });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },
  clearFilter: async (req, res) => {
    try {
      // Reset the filteredItems to an empty array
      filteredItems = [];
      const profileId = req.params.id;
      const view = req.params.view;

      if (view == "guestDashboard") {
        res.redirect("/guestDashboard");
      }
      //If you started at dashboard, redirect to dashboard
      else if (view == "dashboard") {
        res.redirect("/dashboard");

        //if you started at profile, redirect to profile
      } else if (view == "profile") {
        res.redirect("/profile/" + profileId);
      } else if (view == "likedPosts") {
        res.redirect("/likedPosts");
      } else if (view == "savedPosts") {
        res.redirect("/savedPosts");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },
  getViewPost: async (req, res) => {
    try {
      const itemId = req.params.id;
      const view = req.params.view;
      const item = await ItemList.findById(itemId).populate("postedBy");
      const comments = await Comment.find({ post: itemId })
        .populate("postedBy")
        .sort({ createdAt: "desc" })
        .lean();

      if (!item) {
        // Item not found
        return res.status(404).render("error/404");
      }

      if (view == "guestDashboard") {
        res.render("guestViewPost.ejs", { item, comments: comments });
      } else {
        res.render("viewPost.ejs", {
          item,
          comments: comments,
          user: req.user,
        });
      }
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
  reportPost: async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    try {
      // Find the post by ID
      const post = await ItemList.findById(postId);

      if (!post) {
        return res.status(404).render("error/404");
      }

      if (post.reportedBy.includes(userId)) {
        // User has already reported this post
        return res.status(400).send("You've already reported this post.");
      }

      // Add the user's ID to the reportedBy array
      post.reportedBy.push(userId);

      // Increment the report count
      post.reportCount++;

      await post.save();

      if (post.reportCount >= 2) {
        // Call a function to move the post to a new collection
        movePostToReportedCollection(post);
      }

      res.redirect("back");
    } catch (error) {
      console.error(error);
      res.status(500).render("error/500");
    }
  },
};
