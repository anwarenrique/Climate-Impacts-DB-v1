const express = require("express");
const router = express.Router();
const passport = require("passport");
// const homeController = require('../controllers/home')

//Auth with Google
//@route GET /auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

//Google auth callback
//@route GET /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/feed");
  }
);

//Logout user
//@route /auth/logout

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/feed");
  });
});

module.exports = router;
