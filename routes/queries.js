var express = require("express");
var router = express.Router();

// REQUIREMENTS
var Money = require("../models/money.js");
var compute = require("../data.js");
var constants = require("../constants.js");

router.get("/", (req, res) => {

  if (constants.adjustingQuery.minDate || constants.adjustingQuery.maxDate || constants.adjustingQuery.type || constants.adjustingQuery.sortType) {
    // Adjusting current query
    constants.currentQuery = compute.adjustCurrentQuery(constants.currentQuery, constants.dateInfo.minDate, constants.dateInfo.maxDate, constants.removeOptions, constants.adjustingQuery, constants.dateAdjusted, ["type", "date.day", "date.month", "date.year"]);

    if (constants.adjustingQuery.minDate || constants.adjustingQuery.maxDate) {
      constants.dateAdjusted = true;
    }

    constants.adjustingQuery.minDate = false;
    constants.adjustingQuery.maxDate = false;
    constants.adjustingQuery.type = false;
    constants.adjustingQuery.sortType = false;


    constants.sortOptions = {"date.day": 1, "date.month": 1, "date.year": 1};

  } else {

    if (JSON.stringify(req.query) == "{}") {
      res.redirect("/finances");
    } else {
      constants.dateInfo.minDate = compute.getDateString(req.query.minDate);
      constants.dateInfo.maxDate = compute.getDateString(req.query.maxDate);
      constants.removeOptions.minDate = false;
      constants.removeOptions.maxDate = false;
      constants.removeOptions.sortType = false;
      constants.dateAdjusted = false;


      constants.sortOptions = compute.sortQueryResult(req.query.sortType);
      constants.currentSortOption = compute.getSortQueryString(req.query.sortType);
      constants.currentQuery = compute.createQueryObj(req.query, ["type", "date.day", "date.month", "date.year"]);
    }
  }

  Money.find(constants.currentQuery, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    let date = compute.formattedDate();

    compute.addAmount(moneys, 0, 0, (income, expense) => {
      res.render("finances/finances",
      {amounts: moneys, minDate: constants.dateInfo.minDate, maxDate: constants.dateInfo.maxDate,
        minAdjusted: constants.removeOptions.minDate, maxAdjusted: constants.removeOptions.maxDate,
        sortAdjusted: constants.removeOptions.sortType, sortType: constants.currentSortOption,
        date: date, income: income, expense: expense, theme: constants.currentTheme, all: false, type: constants.currentQuery.type});
    });

  }).sort(constants.sortOptions);

})


router.get("/queries", (req, res) => {

  Money.find(constants.currentQuery, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    constants.removeOptions.minDate = false;
    constants.removeOptions.maxDate = false;
    let date = compute.formattedDate();


    compute.addAmount(moneys, 0, 0, (income, expense) => {
      res.render("finances/finances", {amounts: moneys, date: date, minDate: constants.dateInfo.minDate, maxDate: constants.dateInfo.maxDate,
          minAdjusted: constants.removeOptions.minDate, maxAdjusted: constants.removeOptions.maxDate,
          sortAdjusted: constants.removeOptions.sortType, sortType: constants.currentSortOption,
          income: income, expense: expense, all: false, theme: constants.currentTheme, type: constants.currentQuery.type});
    });

  }).sort({"date.day": 1, "date.month": 1, "date.year": 1});

})

router.post("/queries/adjust", (req, res) => {

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

  res.redirect("/finances/amounts");

});

module.exports = router;