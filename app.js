var express = require("express"),
    bodyparser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    mongo = require("mongodb").MongoClient,
    app = express();

//******* Requirements ***************
var Money = require("./models/money.js");
var compute = require(__dirname + "/data.js");
var constants = require(__dirname + "/constants.js");


// ****** App Configuration *********
app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

mongoose.connect(constants.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, (err, client) => {
  if (err) {
    console.error(err);
    return;
  }
});


app.get("/", (req, res) => {

  constants.currentQuery = {};
  constants.currentSortOption = "";
  constants.adjustingQuery = compute.setQuery(constants.adjustingQuery, false);

  Money.find({}, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    const date = compute.formattedDate();

    compute.addAmount(moneys, 0, 0, (income, expense) => {
      res.render("finances/finances", {amounts: moneys, date: date, income: income, expense: expense, all: true, type: "none"});
    })

  }).sort({"date.day": 1, "date.month": 1, "date.year": 1});
})

app.get("/about", (req, res) => {
  res.render("about");
});


app.get("/amounts", (req, res) => {


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
      res.redirect("/");
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
        date: date, income: income, expense: expense, all: false, type: constants.currentQuery.type});
    });

  }).sort(constants.sortOptions);


})

app.get("/amounts/queries", (req, res) => {

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
          income: income, expense: expense, all: false, type: constants.currentQuery.type});
    });

  }).sort({"date.day": 1, "date.month": 1, "date.year": 1});

})


app.post("/", (req, res) => {

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

app.post("/amounts/queries/adjust", (req, res) => {

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

  res.redirect("/amounts");

});

app.delete("/:itemID", (req, res) => {
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


app.listen(constants.portNum, () => {
  console.log(`Listening at ${constants.portNum}...`);
})
