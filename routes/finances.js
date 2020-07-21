var express = require("express"),
    router = express.Router(),
    middleware = require("../middleware/index.js")

// REQUIREMENTS
var Money     = require("../models/money.js"),
    User      = require("../models/user.js"),
    compute   = require("../data.js"),
    constants = require("../constants.js");

// GET ALL MONEY ENTRIES
router.get("/:page", middleware.isLoggedIn, (req, res) => {
  var resultsPerPage = 10;
  var currentPage = req.params.page || 1;
  constants.currentQuery = {};
  constants.currentSortOption = "";
  constants.adjustingQuery = compute.setQuery(constants.adjustingQuery, false);
  constants.searchRetained = false;
  var incomeTotal = 0, expenseTotal = 0;
  var incomeList;
  var expenseList;
  var incomeCount, expenseCount;

  User.find({"_id" : req.user._id}, (err, user) => {
    if (err) {
      throw new Error("Error: User not found.");
    }

    // FIND ALL INCOME
    Money.find({"_id": user[0].moneyList, type: "income"}, (err, incomes) => {

    })
    .sort({"date.day": 1, "date.month": 1, "date.year": 1})
    .skip((resultsPerPage * currentPage) - resultsPerPage)
    .limit(resultsPerPage)
    .exec((err, incomes) => {
      Money.count().exec((err, count) => {
        if (err) return next(err);
        incomeCount = count;
      });
      incomeList = incomes;
      incomeTotal = compute.addAmountOfType(incomes, "income");
    })

    // FIND ALL EXPENSE
    Money.find({"_id": user[0].moneyList, type: "expense"}, (err, expenses) => {

    })
    .sort({"date.day": 1, "date.month": 1, "date.year": 1})
    .skip((resultsPerPage * currentPage) - resultsPerPage)
    .limit(resultsPerPage)
    .exec((err, expenses) => {
      Money.count().exec((err, count) => {
        if (err) return next(err);
        expenseCount = count;
        expenseCount >= incomeCount ? totalCount = expenseCount : totalCount = incomeCount;
        console.log(totalCount);
        expenseList = expenses;
        expenseTotal = compute.addAmountOfType(expenses, "expense");
        const date = compute.formattedDate();

        res.render("finances/finances",
        {
          current: currentPage, pages: Math.ceil((totalCount - 1) / resultsPerPage), incomes: incomeList, expenses: expenseList,
          theme: constants.currentTheme, date: date, incomeTotal: incomeTotal, expenseTotal: expenseTotal, all: true,
          type: "none"
        });

      });


    })

  });
});

router.post("/theme", middleware.isLoggedIn, (req, res) => {
  constants.currentTheme == "dark" ? constants.currentTheme = "light" : constants.currentTheme = "dark";
  res.redirect("back");
})

router.post("/:page", middleware.isLoggedIn, (req, res) => {
   var page = req.params.page || 1;

    var author = {
      id: req.user._id,
      username: req.user.username
    }

    const newAmount = compute.getAmountDetails(req.body, req.body.newDate, req.body.newType, req.body.newAmount, req.body.newDescription, author);

    if (newAmount.amount > 99999 || newAmount.amount == 0) {
      req.flash("error", "Amount is invalid, please try again.")
    } else {
      Money.create(newAmount, (err, newMoney) => {
        if (err) {
          req.flash("error", "Error: New entry could not be created, please try again.")
          res.redirect("/finances/1");
          return;
        }

        User.findByIdAndUpdate({"_id" : req.user._id}, {$push: {moneyList: newMoney}}, (err, updatedUser) => {
          if (err) {
            throw new Error("Error: User information could not be updated.")
          }
        });

      });
    }

    if (JSON.stringify(constants.currentQuery) == "{}") {
      res.redirect("/finances/1")
    } else {
      res.redirect("/queries");
    }

});





module.exports = router;
