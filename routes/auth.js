var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user.js");
var constants = require("../constants.js");

router.get("/", function(req, res){
   res.render("register", {error: ""});
});

router.get("/about", (req, res) => {
  res.render("about");
});

router.post("/register", (req, res) => {

  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if (err) {
      return res.render("register", {error: err.message});
    }

    //log in user and redirect to finances
    passport.authenticate("local")(req, res, () => {
      console.log("Successful Authentication");
      res.redirect("/finances");
    });

  });
});

router.get("/login", (req, res) => {
  res.render("login", {page: "login"});
});

// handle login logic
router.post("/login", passport.authenticate("local", {
  successRedirect: "/finances",
  failureRedirect: "/login"
}),(req, res) => {

});


router.get("/logout", (req, res) => {
  req.logout();
  console.log("Successful logout.")
  res.redirect("/login");
});

module.exports = router;
