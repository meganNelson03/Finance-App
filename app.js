var express               = require("express"),
    bodyparser            = require("body-parser"),
    mongoose              = require("mongoose"),
    methodOverride        = require("method-override"),
    mongo                 = require("mongodb").MongoClient,
    passport              = require("passport"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    app = express();

var User = require("./models/user.js");

//******* Requirements ***************
var constants = require(__dirname + "/constants.js");
var financeRoute = require("./routes/finances.js");
var queryRoute = require("./routes/queries.js")
var authRoute = require("./routes/auth.js");

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



//*** PASSPORT AUTH *****

// PASSPORT CONFIG:
app.use(require("express-session")({
  secret: "Megan is the best coder alive",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate())); // .authenticate comes with passport-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// middleware that runs for every single route
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

//**** CONNECT ROUTES *******
app.use("/", authRoute);
app.use("/finances", financeRoute);
app.use("/finances/amounts", queryRoute);


app.listen(constants.portNum, () => {
  console.log(`Listening at ${constants.portNum}...`);
})
