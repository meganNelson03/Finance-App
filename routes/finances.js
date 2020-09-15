var express = require("express"),
    router = express.Router(),
    middleware = require("../middleware/index.js")

// REQUIREMENTS
var Money     = require("../models/money.js"),
    User      = require("../models/user.js"),
    compute   = require("../data.js"),
    constants = require("../constants.js");


router.get("/", middleware.isLoggedIn, (req, res) => {
  res.redirect("/finances/1");
})

// GET ALL MONEY ENTRIES
router.get("/:page", middleware.isLoggedIn, (req, res) => {
  var resultsPerPage = 10;
  var currentPage = req.params.page || 1;
  constants = compute.resetQuery(constants);
  var incomeTotal = 0, expenseTotal = 0;
  var incomeList, expenseList, incomeCount, expenseCount;


  User.find({"_id" : req.user._id}, (err, user) => {
    if (err) {
      throw new Error("Error: User not found.");
    }

    // populate income and expense fields
    Money.find({"_id": user[0].moneyList}, (err, moneys) => {
      if (err) {
        req.flash("error", "Couldn't find user's finances list. Please login again.")
        res.redirect("/login");
      }

      incomeTotal = compute.addAmountOfType(moneys, "income");
      expenseTotal = compute.addAmountOfType(moneys, "expense");

    });

    // FIND ALL INCOME
    Money.find({"_id": user[0].moneyList, type: "income"}, (err, incomes) => {
      if (err) {
        req.flash("error", "Couldn't find user's finances list. Please try again.");
        res.redirect("/login");
        return;
      }

    })
    .sort({"date.day": 1, "date.month": 1, "date.year": 1})
    .skip((resultsPerPage * currentPage) - resultsPerPage)
    .limit(resultsPerPage)
    .exec((err, incomes) => {
      Money.find({"_id": user[0].moneyList}).count().exec((err, count) => {
        if (err) return next(err);
        incomeCount = count;
      });
      incomeList = incomes;
    })

    // FIND ALL EXPENSE
    Money.find({"_id": user[0].moneyList, type: "expense"}, (err, expenses) => {
      if (err) {
        req.flash("error", "Couldn't find user's finances list. Please try again.");
        res.redirect("/login");
        return;
      }


    })
    .sort({"date.day": 1, "date.month": 1, "date.year": 1})
    .skip((resultsPerPage * currentPage) - resultsPerPage)
    .limit(resultsPerPage)
    .exec((err, expenses) => {

      Money.find({"_id": user[0].moneyList}).count().exec((err, count) => {
        if (err) return next(err);
        const date = compute.formattedDate();
        var total;
        count > incomeCount ? total = count : total = incomeCount;

        res.render("finances/finances",
        {
          current: currentPage, pages: Math.ceil((total / resultsPerPage)), incomes: incomeList,
          expenses: expenses, theme: constants.currentTheme, date: date, incomeTotal: incomeTotal,
          expenseTotal: expenseTotal, all: true, type: "none"
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
