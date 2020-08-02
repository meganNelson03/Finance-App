var express = require("express"),
    router = express.Router(),
    middleware = require("../middleware/index.js");



// REQUIREMENTS
var Money     = require("../models/money.js"),
    User      = require("../models/user.js"),
    compute   = require("../data.js"),
    constants = require("../constants.js");


router.get("/", (req, res) => {

  User.find({_id: req.user._id}, (err, user) => {
    if (err) {
      req.flash("error", "Sorry, we had an issue. Could you log in again?");
      res.redirect("/");
      return;
    }

    constants.currentQuery._id = user[0].moneyList;

    Money.find(constants.currentQuery, (err, moneys) => {
      if (err) {

        req.flash("error", "Could not identify your search. Please try again");
        res.redirect("/finances/1");
        return;
      }

      constants.removeOptions.minDate = false;
      constants.removeOptions.maxDate = false;
      let date = compute.formattedDate();


      compute.addAmount(moneys, 0, 0, (income, expense) => {
        res.render("finances/finances", {current: 1, pages: Math.ceil(constants.itemCount / constants.resultsPerPage), amounts: moneys, date: date, minDate: constants.dateInfo.minDate, maxDate: constants.dateInfo.maxDate,
            minAdjusted: constants.removeOptions.minDate, maxAdjusted: constants.removeOptions.maxDate,
            sortAdjusted: constants.removeOptions.sortType, sortType: constants.currentSortOption,
            incomeTotal: income, expenseTotal: expense, all: false, theme: constants.currentTheme, type: constants.currentQuery.type});
      });

    }).sort({"date.day": 1, "date.month": 1, "date.year": 1});

  })

})

router.post("/adjust", (req, res) => {

  if (req.body.removeItem == "minDate") {
    constants.removeOptions.minDate = true;
    constants.adjustingQuery.minDate = true;
  } else if (req.body.removeItem == "maxDate") {
    constants.removeOptions.maxDate = true;
    constants.adjustingQuery.maxDate = true;
  } else if (req.body.removeItem == "type") {
    constants.adjustingQuery.type = true;
  } else if (req.body.removeItem == "sortType") {
    constants.adjustingQuery.sortType = true;
  }

  res.redirect("/amounts/1");

});

module.exports = router;
