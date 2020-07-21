var express     = require("express"),
    router      = express.Router(),
    middleware  = require("../middleware/index.js");

// REQUIREMENTS
var Money     = require("../models/money.js"),
    User      = require("../models/user.js"),
    compute   = require("../data.js"),
    constants = require("../constants.js");

router.get("/", middleware.isLoggedIn, (req, res) => {
  res.redirect("/amounts/1");
})

router.get("/:page", middleware.isLoggedIn, (req, res) => {

  currentPage = req.params.page || 1;

  if (compute.isAdjusting(constants.adjustingQuery)) {
    constants.currentQuery = compute.adjustCurrentQuery(constants, ["type", "date.day", "date.month", "date.year"]);



    if (constants.adjustingQuery.minDate || constants.adjustingQuery.maxDate) {
      constants.dateAdjusted = true;
    } else if (constants.adjustingQuery.sortType) {
      constants.sortOptions = {"date.day": 1, "date.month": 1, "date.year": 1};
    }
    constants.adjustingQuery = compute.setQueryToFalse(constants.adjustingQuery);
    constants.searchRetained = true;

    if (typeof constants.currentQuery.type != "undefined" && constants.currentQuery.type == "income") {
      res.redirect("/amounts/incomes/1");
      return;
    } else if (typeof constants.currentQuery.type != "undefined" && constants.currentQuery.type == "expense") {
      res.redirect("/amounts/expenses/1");
      return;
    }

  } else {

    if (JSON.stringify(req.query) == "{}" && !(constants.searchRetained)) {
      res.redirect("/finances/1");
      return;
    }

    if (JSON.stringify (req.query) == "{}") {
      if (typeof constants.currentQuery.type != "undefined" && constants.currentQuery.type == "income") {
        res.redirect("/amounts/incomes/" + currentPage);
        return;
      } else if (typeof constants.currentQuery.type != "undefined" && constants.currentQuery.type == "expense") {
        res.redirect("/amounts/expenses/" + currentPage);
        return;
      }
    }

    if (JSON.stringify(req.query) != "{}" ) {
      constants.dateInfo.minDate = compute.getDateString(req.query.minDate);
      constants.dateInfo.maxDate = compute.getDateString(req.query.maxDate);

      constants.removeOptions = compute.setQueryToFalse(constants.removeOptions);
      constants.dateAdjusted = false;

      constants.sortOptions = compute.sortQueryResult(req.query.sortType);
      constants.currentSortOption = compute.getSortQueryString(req.query.sortType);
      constants.currentQuery = compute.createQueryObj(req.query, ["type", "date.day", "date.month", "date.year"]);
      constants.searchRetained = true;

      if (typeof constants.currentQuery.type != "undefined" && constants.currentQuery.type == "income") {
        res.redirect("/amounts/incomes/1");
        return;
      } else if (typeof constants.currentQuery.type != "undefined" && constants.currentQuery.type == "expense") {
        res.redirect("/amounts/expenses/1");
        return;
      }
    }

  }

  User.find({"_id" : req.user._id}, (err, user) => {
    if (err) {
      req.flash("error", "Couldn't find user. Please try again.")
      res.redirect("/login");
      return;
    }


    var incomeList, expenseList, incomeCount = 0, expenseCount = 0, incomeTotal = 0, expenseTotal = 0;

    constants.currentQuery._id = user[0].moneyList;
    var queryObject = Object.assign({}, constants.currentQuery);
    queryObject.type = "income";


    Money.find(queryObject, (err, incomes) => {
      incomeList = incomes;
    })
    .sort(constants.sortOptions)
    .skip((constants.resultsPerPage * currentPage) - constants.resultsPerPage)
    .limit(constants.resultsPerPage)
    .exec(function(err, incomes) {
      Money.count().exec((err, count) => {
        if (err) return next(err);
        incomeCount = count;
      })
      incomeTotal = compute.addAmountOfType(incomes);

    })

    queryObject.type = "expense";

    Money.find(queryObject, (err, expenses) => {
      expenseList = expenses;
    })
    .sort(constants.sortOptions)
    .skip((constants.resultsPerPage * currentPage) - constants.resultsPerPage)
    .limit(constants.resultsPerPage)
    .exec(function(err, expenses) {
      Money.count().exec((err, count) => {
        if (err) return next(err);
        expenseCount = count;
        var items = expenseCount >= incomeCount ? expenseCount : incomeCount;
        const date = compute.formattedDate();
        expenseTotal = compute.addAmountOfType(expenses);
        res.render("finances/finances", {current: currentPage, pages: Math.ceil(items / constants.resultsPerPage),
          incomes: incomeList, expenses: expenseList, minDate: constants.dateInfo.minDate, maxDate: constants.dateInfo.maxDate,
          minAdjusted: constants.removeOptions.minDate, maxAdjusted: constants.removeOptions.maxDate,
          sortAdjusted: constants.removeOptions.sortType, sortType: constants.currentSortOption,
          date: date, incomeTotal: incomeTotal, expenseTotal: expenseTotal, theme: constants.currentTheme, all: false, type: constants.currentQuery.type});
      })

    })

  });

});

router.get("/incomes/:page", (req, res) => {
  currentPage = req.params.page || 1;

  User.find({"_id": req.user._id}, (err, user) => {
    if (err) {
      req.flash("error", "Couldn't find user. Please try again.")
      res.redirect("/login");
      return;
    }

    constants.currentQuery._id = user[0].moneyList;

      Money.find(constants.currentQuery, (err, incomes) => {
      if (err) {
        req.flash("Error: Couldn't find income information. Please try again.");
        res.redirect("/amounts/1");
        return;
      }
      })
      .sort(constants.sortOptions)
      .skip((constants.resultsPerPage * currentPage) - constants.resultsPerPage)
      .limit(constants.resultsPerPage)
      .exec((err, incomes) => {
        Money.count().exec((err, count) => {
          if (err) return next(err);
          compute.addAmountType(incomes, "income", (income) => {
            const date = compute.formattedDate();
            constants.itemCount = count;
            res.render("finances/finances", {current: currentPage, pages: Math.ceil(count / constants.resultsPerPage), amounts: incomes, minDate: constants.dateInfo.minDate, maxDate: constants.dateInfo.maxDate,
              minAdjusted: constants.removeOptions.minDate, maxAdjusted: constants.removeOptions.maxDate,
              sortAdjusted: constants.removeOptions.sortType, sortType: constants.currentSortOption,
              date: date, incomeTotal: income, theme: constants.currentTheme, all: false, type: constants.currentQuery.type
            });
          });
        });
      });
    });
});

router.get("/expenses/:page", (req, res) => {
  currentPage = req.params.page || 1;

  User.find({"_id": req.user._id}, (err, user) => {
    if (err) {
      req.flash("error", "Couldn't find user. Please try again.")
      res.redirect("/login");
      return;
    }

    constants.currentQuery._id = user[0].moneyList;

      Money.find(constants.currentQuery, (err, incomes) => {
      if (err) {
        req.flash("Error: Couldn't find income information. Please try again.");
        res.redirect("/amounts/1");
        return;
      }
      })
      .sort(constants.sortOptions)
      .skip((constants.resultsPerPage * currentPage) - constants.resultsPerPage)
      .limit(constants.resultsPerPage)
      .exec((err, expenses) => {
        Money.count().exec((err, count) => {
          if (err) return next(err);
          compute.addAmountType(expenses, "expense", (expense) => {
            const date = compute.formattedDate();
            constants.itemCount = count;
            res.render("finances/finances", {current: currentPage, pages: Math.ceil(count / constants.resultsPerPage), amounts: expenses, minDate: constants.dateInfo.minDate, maxDate: constants.dateInfo.maxDate,
              minAdjusted: constants.removeOptions.minDate, maxAdjusted: constants.removeOptions.maxDate,
              sortAdjusted: constants.removeOptions.sortType, sortType: constants.currentSortOption,
              date: date, expenseTotal: expense, theme: constants.currentTheme, all: false, type: constants.currentQuery.type
            });
          });
        });
      });
    });
});




module.exports = router;
