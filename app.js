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
app.use(methodOverride("_method"));

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

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

app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine", "ejs");

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

  currentQuery = compute.createQueryObj(req.query, "none", ["type", "date.day", "date.month", "date.year"]);

  Money.find(currentQuery, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    compute.addAmount(moneys, 0, 0, (income, expense) => {

      res.render("finances", {amounts: moneys, date: date, income: income, expense: expense, type: currentQuery.type});
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

  console.log(req);

    const dateInfo = {
      day: req.body.newDate.substr(8, 2),
      month: req.body.newDate.substr(5, 2),
      year: req.body.newDate.substr(0, 4)
    }

    const details = {
      type: req.body.type,
      amount: Math.abs(req.body.newAmount),
      date: dateInfo,
      description: req.body.newDescription
    }

    if (details.amount > 99999) {
      console.log("Error: amount is invalid.");
    } else {
      Money.create(details, (err, newMoney) => {
        if (err) {
          console.log(err);
          res.redirect("/");
        }

      });
    }

  if (currentQuery == {}) {
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
