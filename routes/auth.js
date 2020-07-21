var express   = require("express"),
    router    = express.Router(),
    passport  = require("passport"),
    middleware = require("../middleware/index.js");
    flash     = require("connect-flash"),
    User = require("../models/user.js"),
    Money = require("../models/money.js"),
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
  successRedirect: "/finances/1",
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

router.delete("/:itemID", middleware.isLoggedIn, (req, res) => {
  Money.deleteOne({_id: req.params.itemID}, (err, deleted) => {
    if (err) {
      req.flash("error", "Error: Couldn't find entry to delete. Please try again.")
      res.redirect("/finances/1");
    }

    User.findByIdAndUpdate({_id: req.user._id}, {$pull: {moneyList: req.params.itemID}}, (err, user) => {
        if (err) {
          req.flash("error", "Error: There was an issue deleting an entry from your finances list. Please try again.")
          res.redirect("/finances/1");
        }
      });

    if (JSON.stringify(constants.currentQuery) == "{}") {
      res.redirect("/finances/1");
    } else {
      res.redirect("/queries");
    }

  });
})

module.exports = router;
