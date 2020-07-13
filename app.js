var express = require("express"),
    bodyparser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    mongo = require("mongodb").MongoClient,
    app = express();

//******* Requirements ***************
var constants = require(__dirname + "/constants.js");
var financeRoute = require("./routes/finances.js");
var queryRoute = require("./routes/queries.js")

// ****** App Configuration *********
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

//**** CONNECT ROUTES *******
app.use("/", financeRoute);
app.use("/amounts", queryRoute);



app.listen(constants.portNum, () => {
  console.log(`Listening at ${constants.portNum}...`);
})
