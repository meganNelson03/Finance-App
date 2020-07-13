var express = require("express");
var router = express.Router();

// REQUIREMENTS
var Money = require("../models/money.js");
var compute = require("../data.js");
var constants = require("../constants.js");


router.get("/", (req, res) => {
  constants.currentQuery = {};
  constants.currentSortOption = "";
  constants.adjustingQuery = compute.setQuery(constants.adjustingQuery, false);

  Money.find({}, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    const date = compute.formattedDate();

    compute.addAmount(moneys, 0, 0, (income, expense) => {
      res.render("finances/finances", {amounts: moneys, theme: constants.currentTheme, date: date, income: income, expense: expense, all: true, type: "none"});
    })

  }).sort({"date.day": 1, "date.month": 1, "date.year": 1});
})

router.get("/about", (req, res) => {
  res.render("about");
});


router.post("/", (req, res) => {

    const newAmount = compute.getAmountDetails(req.body, req.body.newDate, req.body.newType, req.body.newAmount, req.body.newDescription);

    if (newAmount.amount > 99999) {
      console.log("Error: amount is invalid.");
    } else {
      Money.create(newAmount, (err, newMoney) => {
        if (err) {
          console.log(err);
          res.redirect("/");
        }

      });
    }

    if (JSON.stringify(constants.currentQuery) == "{}") {
      res.redirect("/")
    } else {
      res.redirect("/amounts/queries");
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
      res.redirect("/");
    } else {
      res.redirect("/amounts/queries");
    }

  });
})

module.exports = router;
