var Money = require("./models/money.js");

module.exports.findMinimumDate = function() {
  Money.find()
}


module.exports.formattedDate = function() {
  var date = new Date();
  return date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + "-" + ('0' + date.getDate()).slice(-2);
}

module.exports.getDateString = function getDateString(query) {
  const dateInfo = {
    day: query.substr(8, 2),
    month: query.substr(5, 2),
    year: query.substr(0, 4)
  }

  return dateInfo;
}

function getDateString(query) {
  const dateInfo = {
    day: query.substr(8, 2),
    month: query.substr(5, 2),
    year: query.substr(0, 4)
  }

  return dateInfo;
}


module.exports.getAmountDetails = function(query, queryDate, queryType, queryAmount, queryDescription) {

  const dateInfo = getDateString(queryDate);

  const details = {
    type: queryType,
    amount: Math.abs(queryAmount),
    date: dateInfo,
    description: queryDescription
  }

  return details;

}



module.exports.addAmount = function(amounts, income, expense, callBack) {

  Promise.all(amounts.map(amount => {
    return new Promise((resolve, reject) => {
      if (amount.type == "income") {
        income += amount.amount;
        resolve(income);
      } else {
        expense += amount.amount;
        resolve(expense);
      }
    })
  })).then((values) => {
    callBack(income, expense);
  })

}

module.exports.createQueryObj = function(query, caseList) {

  var newQuery = {};
  var minDay, maxDay, minMonth, maxMonth, minYear, maxYear;

  // remove all "none" values from query
  query = removeQueryValue(query, "none");

  // give date.* MIN and MAX values {"date.day": {$gte: num, $lte: num}}...
  Object.getOwnPropertyNames(query).forEach((key) => {
    if (key.toLowerCase().includes("date")) {
      if (key == "minDate") {
        minDay = parseInt(query[key].substr(8, 2));
        minMonth = parseInt(query[key].substr(5,2));
        minYear = parseInt(query[key].substr(0,4));
      } else if (key == "maxDate") {
        maxDay = parseInt(query[key].substr(8, 2));
        maxMonth = parseInt(query[key].substr(5,2));
        maxYear = parseInt(query[key].substr(0,4));
      }
    } else {
      newQuery[key] = query[key];
    }
  })

  newQuery["date.day"] = {$gte: minDay, $lte: maxDay};
  newQuery["date.month"] = {$gte: minMonth, $lte: maxMonth};
  newQuery["date.year"] = {$gte: minYear, $lte: maxYear};

  return newQuery;

}

function removeQueryValue(query, value) {

  let newQuery = {};

  Object.getOwnPropertyNames(query).forEach(key => {

    if (query[key] != "none") {
      newQuery[key] = query[key];
    }

  });

  return newQuery;
}
