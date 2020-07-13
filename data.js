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

module.exports.sortQueryResult = function(type) {

  if (type == "dateDescending") {
    return {"date.day": -1, "date.month": -1, "date.year": -1};
  } else if (type == "dateAscending") {
    return {"date.day": 1, "date.month": 1, "date.year": 1};
  } else if (type == "amountDescending") {
    return {amount: -1};
  } else if (type == "amountAscending") {
    return {amount: 1};
  }

}

module.exports.getSortQueryString = function(type) {

  if (type == "dateDescending") {
    return "Date Descending";
  } else if (type == "dateAscending") {
    return"Date Ascending";
  } else if (type == "amountDescending") {
    return "Highest Amount";
  } else if (type == "amountAscending") {
    return"Lowest Amount";
  }

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

  query = removeQueryValue(query, "none");

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
    } else if (key != "sortType"){
      newQuery[key] = query[key];
    }
  })

  newQuery["date.day"] = {$gte: minDay, $lte: maxDay};
  newQuery["date.month"] = {$gte: minMonth, $lte: maxMonth};
  newQuery["date.year"] = {$gte: minYear, $lte: maxYear};

  return newQuery;

}

module.exports.adjustCurrentQuery = function(query, minDate, maxDate, removeOptions, adjustingQuery, dateAdjusted, caseList) {

  var newQuery = {};

  Object.getOwnPropertyNames(query).forEach(key => {
    if (key != caseList[0]) {
      newQuery[key] = query[key];
    } else if (key == caseList[0]) {
      if (adjustingQuery[caseList[0]] == false) {
        newQuery[key] = query[key];
      }
    }
  })

  if (adjustingQuery.minDate && !(dateAdjusted)) {

    newQuery[caseList[1]] = {$lte: maxDate.day};
    newQuery[caseList[2]] = {$lte: maxDate.month};
    newQuery[caseList[3]] = {$lte: maxDate.year};

  } else if (adjustingQuery.maxDate && !(dateAdjusted)) {
    newQuery[caseList[1]] = {$gte: minDate.day};
    newQuery[caseList[2]] = {$gte: minDate.month};
    newQuery[caseList[3]] = {$gte: minDate.year};

  } else if (dateAdjusted) {
    console.log("date was adjusted");
    if (removeOptions.minDate || removeOptions.maxDate) {
      newQuery[caseList[1]] = {$gte: 0};
      newQuery[caseList[2]] = {$gte: 0};
      newQuery[caseList[3]] = {$gte: 0};
    }

  }

  if (adjustingQuery.sortType) {
    removeOptions.sortType = true;
  }

  console.log(newQuery);
  return newQuery;
}

module.exports.setQuery = function(query, value) {

  Object.getOwnPropertyNames(query).forEach(key => {
    query[key] = value;
  });

  return query;
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

function getDateString(query) {
  const dateInfo = {
    day: query.substr(8, 2),
    month: query.substr(5, 2),
    year: query.substr(0, 4)
  }

  return dateInfo;
}
