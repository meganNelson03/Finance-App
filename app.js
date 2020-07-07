var express = require("express");
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
const mongo = require("mongodb").MongoClient;


const url = 'mongodb://localhost:27017/finances_site'
const portNum = 3005;

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({extended: true}));
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

app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.get("/", (req, res) => {

  let incomeList, expenseList;
  const date = new Date();
  const dateInfo = {
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getYear()
  }

  const myDateString = date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + "-" + ('0' + date.getDate()).slice(-2);

  Money.find({}, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    res.render("finances", {amounts: moneys, date: myDateString});

  })
})

app.post("/", (req, res) => {

    const dateInfo = {
      day: req.body.newDate.substr(8, 2),
      month: req.body.newDate.substr(5, 2),
      year: req.body.newDate.substr(0, 4)
    }

    const details = {
      type: req.body.newType,
      amount: req.body.newAmount,
      date: dateInfo,
      description: req.body.newDescription
    }

    Money.create(details, (err, newMoney) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      }

      res.redirect("/");

    });


});

app.delete("/:itemID", (req, res) => {
  Money.deleteOne({_id: req.params.itemID}, (err, deleted) => {
    if (err) {
      console.log(err);
    }

    res.redirect("/");

  });
})


app.listen(portNum, () => {
  console.log(`Listening at ${portNum}...`);
})
