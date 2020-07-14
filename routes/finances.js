var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index.js")

// REQUIREMENTS
var Money = require("../models/money.js");
var User = require("../models/user.js");
var compute = require("../data.js");
var constants = require("../constants.js");


router.get("/", middleware.isLoggedIn, (req, res) => {
  constants.currentQuery = {};
  constants.currentSortOption = "";
  constants.adjustingQuery = compute.setQuery(constants.adjustingQuery, false);

  User.find({"_id" : req.user._id}, (err, user) => {
    if (err) {
      console.log(err);
    }

    console.log("user:");
    console.log(user);

    Money.find({"_id": user[0].moneyList}, (err, moneys) => {
      const date = compute.formattedDate();

      compute.addAmount(moneys, 0, 0, (income, expense) => {
        res.render("finances/finances", {amounts: moneys, theme: constants.currentTheme, date: date, income: income, expense: expense, all: true, type: "none"});
      })

    }).sort({"date.day": 1, "date.month": 1, "date.year": 1});

  })
})


router.post("/", middleware.isLoggedIn, (req, res) => {

    var author = {
      id: req.user._id,
      username: req.user.username
    }

    const newAmount = compute.getAmountDetails(req.body, req.body.newDate, req.body.newType, req.body.newAmount, req.body.newDescription, author);

    if (newAmount.amount > 99999) {
      console.log("Error: amount is invalid.");
    } else {
      Money.create(newAmount, (err, newMoney) => {
        if (err) {
          console.log(err);
          res.redirect("/finances");
        }

        console.log("newMoney:");
        console.log(newMoney);

        User.findByIdAndUpdate({"_id" : req.user._id}, {$push: {moneyList: newMoney}}, (err, updatedUser) => {
          if (err) {
            console.log(err);
          }

        })

      });
    }

    if (JSON.stringify(constants.currentQuery) == "{}") {
      res.redirect("/finances")
    } else {
      res.redirect("/finances/amounts/queries");
    }

});

router.post("/theme", middleware.isLoggedIn, (req, res) => {
  constants.currentTheme == "dark" ? constants.currentTheme = "light" : constants.currentTheme = "dark";

  res.redirect("back");
})

router.delete("/:itemID", middleware.isLoggedIn, (req, res) => {
  Money.deleteOne({_id: req.params.itemID}, (err, deleted) => {
    if (err) {
      console.log("Error: Couldn't find Money entry to delete");
    }

    User.findByIdAndUpdate({_id: req.user._id},

        {$pull: {moneyList: req.params.itemID}}
      , (err, user) => {
        if (err) {
          console.log("Error: error deleting item from user's money list")
        }
      });

    if (JSON.stringify(constants.currentQuery) == "{}") {
      res.redirect("/finances");
    } else {
      res.redirect("/finances/amounts/queries");
    }

  });
})

module.exports = router;
