var mongoose = require("mongoose");

var moneySchema = new mongoose.Schema({
	type: String,
  amount: Number,
  date: Date,
	description: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
});

module.exports = mongoose.model("Money", moneySchema);
