const ItemList = require("../models/ItemList");
const User = require("../models/User");
const Comment = require("../models/Comment");
const ReportedPost = require("../models/reportedPost");
const { post } = require("../routes/home");

let filteredItems = []; //declare this variable that will store filtered results
let filterParameters = {
  region: [],
  country: [],
  healthrisk: [],
};
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
      const items = await res.render("dashboard.ejs");
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  getUnifiedDashboard: async (req, res) => {
    try {
      // Fundamental states (req.params)
      const view = req.params.view || "dashboard";
      const profileId = req.params.id;
      console.log(`request received for ${view} view with ${profileId} ID`);

      //check the last view, and clear filter if they came from somewhere else
      if (view != req.session.lastView) {
        filteredItems = [];
        filterParameters = {
          region: [],
          country: [],
          healthrisk: [],
        };
      }

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

      // Helper function to process filters and add them to filterParameters
      const processFilter = (filter, type) => {
        if (Array.isArray(filter)) {
          filter
            .map((item) => item.split(",").map((subItem) => subItem.trim()))
            .flat()
            .forEach((item) => filterParameters[type].push(item));
        } else {
          filter
            .split(",")
            .map((subItem) => subItem.trim())
            .forEach((item) => filterParameters[type].push(item));
        }
      };

      // Process each filter and add to respective array in filterParameters
      if (regionfilter) processFilter(regionfilter, "region");
      if (countryfilter) processFilter(countryfilter, "country");
      if (healthriskfilter) processFilter(healthriskfilter, "healthrisk");

      // Ensuring uniqueness in each filter category
      filterParameters.region = [...new Set(filterParameters.region)];
      filterParameters.country = [...new Set(filterParameters.country)];
      filterParameters.healthrisk = [...new Set(filterParameters.healthrisk)];

      // Logic to make sure profile view only filters and sorts posts made by profile user
      let query = {};
      if (view == "profile") {
        query = ItemList.find({
          postedBy: profileId, // Only select items posted by the specified user
        }).populate("postedBy");
      } else if (view == "savedPosts") {
        query = ItemList.find({
          _id: { $in: user.savedPosts },
        }).populate("postedBy");
      } else if (view == "likedPosts") {
        query = ItemList.find({
          _id: { $in: user.likedPosts },
        }).populate("postedBy");
      } else {
        query = ItemList.find().populate("postedBy");
      }

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
      // console.log("Filtered Items:", filteredItems);

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
      if (sanitizedPage > totalPages && view === "dashboard") {
        let dashboardRedirectUrl = `/feed?page=${totalPages}&sort=${sort}`;

        // Append filters to the URL only if they exist
        if (regionfilter) {
          dashboardRedirectUrl += `&regionfilter=${regionfilter}`;
        }
        if (countryfilter) {
          dashboardRedirectUrl += `&countryfilter=${countryfilter}`;
        }
        if (healthriskfilter) {
          dashboardRedirectUrl += `&healthriskfilter=${healthriskfilter}`;
        }

        return res.redirect(dashboardRedirectUrl);
      } else if (sanitizedPage > totalPages && view === "profile") {
        let profileRedirectUrl = `/feed/profile/${profileId}?page=${totalPages}&sort=${sort}`;

        // Append filters to the URL only if they exist
        if (regionfilter) {
          profileRedirectUrl += `&regionfilter=${regionfilter}`;
        }
        if (countryfilter) {
          profileRedirectUrl += `&countryfilter=${countryfilter}`;
        }
        if (healthriskfilter) {
          profileRedirectUrl += `&healthriskfilter=${healthriskfilter}`;
        }
        return res.redirect(profileRedirectUrl);
      } else if (sanitizedPage > totalPages && view === "savedPosts") {
        let savedPostsRedirectUrl = `/feed/savedPosts?page=${totalPages}&sort=${sort}`;

        // Append filters to the URL only if they exist
        if (regionfilter) {
          savedPostsRedirectUrl += `&regionfilter=${regionfilter}`;
        }
        if (countryfilter) {
          savedPostsRedirectUrl += `&countryfilter=${countryfilter}`;
        }
        if (healthriskfilter) {
          savedPostsRedirectUrl += `&healthriskfilter=${healthriskfilter}`;
        }
        return res.redirect(savedPostsRedirectUrl);
      } else if (sanitizedPage > totalPages && view === "likedPosts") {
        let likedPostsRedirectUrl = `/feed/likedPosts?page=${totalPages}&sort=${sort}`;

        // Append filters to the URL only if they exist
        if (regionfilter) {
          likedPostsRedirectUrl += `&regionfilter=${regionfilter}`;
        }
        if (countryfilter) {
          likedPostsRedirectUrl += `&countryfilter=${countryfilter}`;
        }
        if (healthriskfilter) {
          likedPostsRedirectUrl += `&healthriskfilter=${healthriskfilter}`;
        }
        return res.redirect(likedPostsRedirectUrl);
      }

      const skip = (sanitizedPage - 1) * ITEMS_PER_PAGE;

      query = query.skip(skip).limit(ITEMS_PER_PAGE);

      // Execute Query
      const itemList = await query.exec();

      // Render appropriate view
      const renderData = {
        itemList,
        user,
        regionfilter,
        countryfilter,
        healthriskfilter,
        filterParameters,
        currentPage: page,
        totalPages,
        totalItems,
        currentSort: sort,
      };

      req.session.lastView = view;

      if (view === "profile") {
        const profile = await User.findById(profileId);
        renderData.profile = profile;
        console.log(
          `filtering by ${regionfilter}, ${countryfilter}, ${healthriskfilter}`
        );
        console.log(`showing ${view} view on page ${page}`);
        console.log(filterParameters);
        return res.render("profile.ejs", renderData);
      }
      console.log(
        `filtering by ${regionfilter}, ${countryfilter}, ${healthriskfilter}`
      );
      console.log(`showing ${view} view on page ${page}`);
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
    // Extract the fields from req.body
    const {
      titleinput,
      textinput,
      linkinput,
      numinput,
      regioninput,
      countryinput,
      healthriskinput,
      citationinput,
    } = req.body;

    // Validation checks
    if (!titleinput || titleinput.length > 280) {
      return res.redirect("/formError?error=Invalid title");
    }
    if (textinput && textinput.length > 40000) {
      return res.redirect("/formError?error=Text input is too long");
    }
    if (!linkinput || linkinput.length > 2100) {
      return res.redirect("/formError?error=Invalid link");
    }
    if (!numinput) {
      return res.redirect("/formError?error=Number input is required");
    }

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
    });

    try {
      await newItem.save();
      // Update the user's postCount
      await User.findByIdAndUpdate(req.user.id, { $inc: { postCount: 1 } });
      console.log(newItem);
      res.redirect("/");
    } catch (err) {
      console.log(err);
      if (err) return res.status(500).send(err);
      res.redirect("/formError?error=An error occurred while saving the post");
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
        res.redirect("/feed");
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
      res.redirect("back");
    } catch (err) {
      if (err) return res.status(500).send(err);
    }
  },
  clearFilter: async (req, res) => {
    try {
      // Reset the filteredItems to an empty array
      filteredItems = [];
      filterParameters = {
        region: [],
        country: [],
        healthrisk: [],
      };
      const profileId = req.params.id;
      const view = req.params.view;

      if (view == "guestDashboard") {
        res.redirect("/guestDashboard");
      }
      //If you started at dashboard, redirect to dashboard
      else if (view == "dashboard") {
        res.redirect("/feed");

        //if you started at profile, redirect to profile
      } else if (view == "profile") {
        res.redirect("/feed/profile/" + profileId);
      } else if (view == "likedPosts") {
        res.redirect("/feed/likedPosts");
      } else if (view == "savedPosts") {
        res.redirect("/feed/savedPosts");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },
  getViewPost: async (req, res) => {
    try {
      //Guest or logged in user (req.user)
      let user = req.user;
      if (!req.user) {
        user = {
          _id: "guest",
          likedPosts: [],
          savedPosts: [],
        };
      }

      const itemId = req.params.id;
      const view = req.params.view;
      const item = await ItemList.findById(itemId).populate("postedBy");
      const comments = await Comment.find({ post: itemId })
        .populate("postedBy")
        .sort({ createdAt: "desc" })
        .lean();

      const editCommentId = req.query.editCommentId;
      let editComment = null;
      if (editCommentId) {
        editComment = comments.find(
          (comment) => comment._id.toString() === editCommentId
        );
      }

      if (!item) {
        // Item not found
        return res.status(404).render("error/404");
      }

      res.render("viewPost.ejs", {
        item,
        comments: comments,
        user,
        editComment,
      });

      // if (view == "guestDashboard") {
      //   res.render("guestViewPost.ejs", { item, comments: comments });
      // } else {
      //   res.render("viewPost.ejs", {
      //     item,
      //     comments: comments,
      //     user: req.user,
      //   });
      // }
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
  getFormError: async (req, res) => {
    const error = req.params.error;
    try {
      res.render("error/formError.ejs", { error });
    } catch (err) {
      res.render("error/500");
      if (err) return res.status(500).send(err);
    }
  },
};
