var express = require("express"),
    bodyparser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    mongo = require("mongodb").MongoClient,
    app = express();

var Money = require("./models/money.js");
var compute = require(__dirname + "/data.js");

const portNum = 3005;
const url = 'mongodb://localhost:27017/finances_site';

let currentQuery = {};
let minDate, maxDate;
let adjustingQuery = {
  type: false,
  minDate: false,
  maxDate: false,
  adjustedDate: false
};

// ****** App Configuration *********
app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, (err, client) => {
  if (err) {
    console.error(err);
    return;
  }
});


app.get("/", (req, res) => {

  currentQuery = {};
  adjustingQuery = compute.setQuery(adjustingQuery, false);

  Money.find({}, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    const date = compute.formattedDate();

    compute.addAmount(moneys, 0, 0, (income, expense) => {
      res.render("finances", {amounts: moneys, date: date, income: income, expense: expense, all: true, type: "none"});
    })

  })
})


app.get("/amounts", (req, res) => {

  if (adjustingQuery.minDate || adjustingQuery.maxDate || adjustingQuery.type) {
    // Adjusting current query
    currentQuery = compute.adjustCurrentQuery(currentQuery, minDate, maxDate, adjustingQuery, ["type", "date.day", "date.month", "date.year"]);

    adjustingQuery.minDate = false;
    adjustingQuery.maxDate = false;
    adjustingQuery.type = false;

  } else {

    if (JSON.stringify(req.query) == "{}") {
      res.redirect("/");
    } else {
      minDate = compute.getDateString(req.query.minDate);
      maxDate = compute.getDateString(req.query.maxDate);
      currentQuery = compute.createQueryObj(req.query, ["type", "date.day", "date.month", "date.year"]);
    }
  }

  Money.find(currentQuery, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    let date = compute.formattedDate();

    compute.addAmount(moneys, 0, 0, (income, expense) => {
      res.render("finances",
      {amounts: moneys, minDate: minDate, maxDate: maxDate,
        minAdjusted: minDate.removed, maxAdjusted: maxDate.removed,
        date: date, income: income, expense: expense, all: false, type: currentQuery.type});
    });

  })


})

app.get("/amounts/queries", (req, res) => {

  Money.find(currentQuery, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    minDate.removed = false;
    minDate.removed = false;
    let date = compute.formattedDate();

    compute.addAmount(moneys, 0, 0, (income, expense) => {
      res.render("finances", {amounts: moneys, date: date, minDate: minDate, maxDate: maxDate,
          minAdjusted: minDate.removed, maxAdjusted: minDate.removed,
          income: income, expense: expense, all: false, type: currentQuery.type});
    });

  })

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

    if (JSON.stringify(currentQuery) == "{}") {
      res.redirect("/")
    } else {
      console.log("redirc to /amounts/queries")
      res.redirect("/amounts/queries");
    }

});

app.post("/amounts/queries/adjust", (req, res) => {

  if (req.body.removeItem == "minDate") {
    adjustingQuery.minDate = true;
  } else if (req.body.removeItem == "maxDate") {
    adjustingQuery.maxDate = true;
  } else if (req.body.removeItem == "type") {
    adjustingQuery.type = true;
  }

  res.redirect("/amounts");

});

app.delete("/:itemID", (req, res) => {
  Money.deleteOne({_id: req.params.itemID}, (err, deleted) => {
    if (err) {
      console.log(err);
    }

    if (JSON.stringify(currentQuery) == "{}") {
      res.redirect("/");
    } else {
      res.redirect("/amounts/queries");
    }

  });
})


app.listen(portNum, () => {
  console.log(`Listening at ${portNum}...`);
})
