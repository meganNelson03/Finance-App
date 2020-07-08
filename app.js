var express = require("express");
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
const mongo = require("mongodb").MongoClient;

var compute = require(__dirname + "/data.js");

const url = 'mongodb://localhost:27017/finances_site'
var currentQuery = {};
const portNum = 3005;

var app = express();
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

var Money = require("./models/money.js");



app.get("/", (req, res) => {

  currentQuery = {};
  const date = compute.formattedDate();

  Money.find({}, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    compute.addAmount(moneys, 0, 0, (income, expense) => {
      res.render("finances", {amounts: moneys, date: date, income: income, expense: expense, type: "none"});
    })

  })
})


app.get("/amounts", (req, res) => {

  let amounts = {};
  let date = compute.formattedDate();

  currentQuery = compute.createQueryObj(req.query, ["type", "date.day", "date.month", "date.year"]);

  console.log(currentQuery);
  console.log(req.query);

  Money.find(currentQuery, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    let minDate = compute.getDateString(req.query.minDate);
    let maxDate = compute.getDateString(req.query.maxDate);

    compute.addAmount(moneys, 0, 0, (income, expense) => {

      res.render("finances", {amounts: moneys, minDate: minDate, maxDate: maxDate, date: date, income: income, expense: expense, type: currentQuery.type});
    });

  })


})

app.get("/amounts/queries", (req, res) => {

  let amounts = {};
  let date = compute.formattedDate();

  Money.find(currentQuery, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    compute.addAmount(moneys, 0, 0, (income, expense) => {
      res.render("finances", {amounts: moneys, date: date, income: income, expense: expense, type: currentQuery.type});
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
      res.redirect("/amounts/queries");
    }

});

app.delete("/:itemID", (req, res) => {
  Money.deleteOne({_id: req.params.itemID}, (err, deleted) => {
    if (err) {
      console.log(err);
    }

    if (currentQuery == {}) {
      res.redirect("/");
    } else {
      res.redirect("/amounts/queries");
    }

  });
})


app.listen(portNum, () => {
  console.log(`Listening at ${portNum}...`);
})
