var mongoose = require("mongoose");

var moneySchema = new mongoose.Schema({
	type: String,
  amount: Number,
  date: {
    day: Number,
    month: Number,
    year: Number
  },
	description: String
});

module.exports = mongoose.model("Money", moneySchema);
