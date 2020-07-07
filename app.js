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

  let income = 0, expense = 0;
  const date = new Date();
  const dateInfo = {
    day: ('0' + date.getDate()).slice(-2),
    month: date.getMonth(),
    year: date.getFullYear()
  }

  const myDateString = date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + "-" + ('0' + date.getDate()).slice(-2);

  Money.find({}, (err, moneys) => {
    if (err) {
      console.log(err);
    }

    Promise.all(moneys.map(money => {

      return new Promise((resolve, reject) => {
        if (money.amount > 0) {
          income += money.amount;
          resolve(income);
        } else {
          expense += money.amount;
          resolve(expense);
        }

      })
    })).then(() => {
      res.render("finances", {amounts: moneys, date: myDateString, income: income, expense: expense});
    })

  })
})


app.get("/amounts", (req, res) => {


  Money.find({"date.month" : req.query.selectMonth}, (err, moneyList) => {
    if (err) {
      console.log(err);
    }

    console.log(moneyList);

    res.render("moneylist", {moneyList: moneyList});
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

    if (details.amount < -99999 || details.amount > 99999) {
      console.log("Error: amount is invalid.");
    } else {
      Money.create(details, (err, newMoney) => {
        if (err) {
          console.log(err);
          res.redirect("/");
        }
      });
    }

  res.redirect("/");

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
