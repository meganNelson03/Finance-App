var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index.js")

// REQUIREMENTS
var Money = require("../models/money.js");
var compute = require("../data.js");
var constants = require("../constants.js");


router.get("/", middleware.isLoggedIn, (req, res) => {
  constants.currentQuery = {};
  constants.currentSortOption = "";
  constants.adjustingQuery = compute.setQuery(constants.adjustingQuery, false);
  console.log("id:");
  console.log(req.user._id);

  Money.find({"author.id": req.user._id}, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    const date = compute.formattedDate();

    compute.addAmount(moneys, 0, 0, (income, expense) => {
      res.render("finances/finances", {amounts: moneys, theme: constants.currentTheme, date: date, income: income, expense: expense, all: true, type: "none"});
    })

  }).sort({"date.day": 1, "date.month": 1, "date.year": 1});
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

      });
    }

    if (JSON.stringify(constants.currentQuery) == "{}") {
      res.redirect("/finances")
    } else {
      res.redirect("/finances/amounts/queries");
    }

});

router.post("/theme", (req, res) => {
  constants.currentTheme == "dark" ? constants.currentTheme = "light" : constants.currentTheme = "dark";

  res.redirect("back");
})

router.delete("/:itemID", (req, res) => {
  Money.deleteOne({_id: req.params.itemID}, (err, deleted) => {
    if (err) {
      console.log(err);
    }

    if (JSON.stringify(constants.currentQuery) == "{}") {
      res.redirect("/finances");
    } else {
      res.redirect("/finances/amounts/queries");
    }

  });
})

module.exports = router;
