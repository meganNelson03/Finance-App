var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: "String",
	password: "String",
  moneyList: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Money"
      }
  ]
});

UserSchema.methods.validPassword = function( pwd ) {
    return ( this.password === pwd );
};

UserSchema.methods.getPassword = function () {
	return this.password;
}

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
