var express   = require("express"),
    router    = express.Router(),
    passport  = require("passport"),
    flash     = require("connect-flash"),
    User = require("../models/user.js"),
    constants = require("../constants.js");

router.get("/", function(req, res) {
   res.render("register");
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

    passport.authenticate("local")(req, res, () => {
      req.flash("success", "You've successfully signed up, " + user.username + "!");
      res.redirect("/finances");
    });

  });
});

router.get("/login", (req, res) => {
  res.render("login");
});


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
