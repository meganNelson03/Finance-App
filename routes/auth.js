var express = require("express");
var router = express.Router();
var passport = require("passport");
var flash = require("connect-flash");
var User = require("../models/user.js");
var constants = require("../constants.js");

router.get("/", function(req, res){
   res.render("register", {error: ""});
});

router.get("/about", (req, res) => {
  res.render("about");
});

router.get("/contact", (req, res) => {
  res.render("contact");
});

router.post("/register", (req, res) => {

  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if (err) {
      return res.render("register", {error: err.message});
    }

    //log in user and redirect to finances
    passport.authenticate("local")(req, res, () => {
      console.log("Successful Authentication");
      req.flash("success", "You've successfully signed up, " + user.username + "!");
      res.redirect("/finances");
    });

  });
});

router.get("/login", (req, res) => {
  res.render("login");
});

// handle login logic
router.post("/login", passport.authenticate("local", {
  successRedirect: "/finances",
  failureRedirect: "/login",
  failureFlash: {type: "error", message: "Invalid username or password."},
  successFlash: "Welcome back!"
}), (req, res) => {
});


router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You've logged out.");
  res.redirect("/");
});

module.exports = router;
