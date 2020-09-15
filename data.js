module.exports.adjustConstantsObj = function(query) {
  query.currentQuery = module.exports.adjustCurrentQuery(query, ["type", "date"]);
  query.dateAdjusted = module.exports.isAdjustingDate(query.adjustingQuery);
  query.sortOptions = module.exports.getSortOptions(query);
  query.adjustingQuery = module.exports.setQueryToFalse(query.adjustingQuery);
  query.searchRetained = true;

  return query;
}

module.exports.createSearchObj = function(query, request) {

  query.dateInfo.minDate = module.exports.getDateString(request.query.minDate);
  query.dateInfo.maxDate = module.exports.getDateString(request.query.maxDate);

  query.removeOptions = module.exports.setQueryToFalse(query.removeOptions);
  query.dateAdjusted = false;

  query.sortOptions = module.exports.sortQueryResult(request.query.sortType);
  query.currentSortOption = module.exports.getSortQueryString(request.query.sortType);
  query.currentQuery = module.exports.createQueryObj(request.query, ["type", "date.day", "date.month", "date.year"]);
  query.searchRetained = true;

  return query;
}

module.exports.populateFields = function(query, Object) {

  Object.find(query, (err, cursor) => {
    if (err) {

    }
  })


}



module.exports.resetQuery = function(query) {

  query.currentQuery = {};
  query.currentSortOption = "";
  query.adjustingQuery = module.exports.setQuery(query.adjustingQuery, false);
  query.searchRetained = false;

  return query;
}

module.exports.formattedDate = function() {
  var date = new Date();
  return date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + "-" + ('0' + date.getDate()).slice(-2);
}

module.exports.getDateString = function getDateString(query) {
  const date = {
    day: query.substr(8, 2),
    month: query.substr(5, 2),
    year: query.substr(0, 4)
  }

  return new Date(`${date.year}-${date.month}-${date.day}:00:00.000Z`);

}

module.exports.getAmountDetails = function(query, queryDate, queryType, queryAmount, queryDescription, author) {

  const dateInfo = module.exports.getDateString(queryDate);


  const details = {
    type: queryType,
    amount: Math.abs(queryAmount),
    date: dateInfo,
    description: queryDescription,
    author: author
  }


  return details;

}

module.exports.sortQueryResult = function(type) {

  if (type == "dateDescending") {
    return {date: -1};
  } else if (type == "dateAscending") {
    return {date: 1};
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
    return "Date Ascending";
  } else if (type == "amountDescending") {
    return "Highest Amount";
  } else if (type == "amountAscending") {
    return "Lowest Amount";
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

module.exports.addAmountType = function(amounts, type, callBack) {

  var total = 0;

  Promise.all(amounts.map(amount => {
    return new Promise((resolve, reject) => {
      if (amount.type == type) {
        total += amount.amount;
        resolve(total);
      }
    })
  })).then((values) => {
    callBack(total);
  })


}

module.exports.addAmountOfType = function(amounts, type) {
  var total = 0;

  Promise.all(amounts.map(amount => {
    return new Promise((resolve, reject) => {
      if (amount.type == type) {
        total += amount.amount;
        resolve(total);
      }
    })
  }))

  return total;
}

module.exports.setQueryToFalse = function(query) {

  Object.getOwnPropertyNames(query).forEach((key) => {
    query[key] = false;
  });

  return query;
}

module.exports.isAdjusting = function(query) {

  var values = Object.values(query);

  for (const value of values) {
    if (value) {
      return true;
    }
  }

  return false;
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


  var dateOne = new Date(`${minMonth} ${minDay} ${minYear}`);
  var dateTwo = new Date(`${maxMonth} ${maxDay} ${maxYear}`);

  newQuery["date"] = {$gte: dateOne, $lte: dateTwo}

  return newQuery;

}

module.exports.adjustCurrentQuery = function(query, caseList) {

  var newQuery = {};

  Object.getOwnPropertyNames(query.currentQuery).forEach(key => {
    if (key != caseList[0]) {
      newQuery[key] = query.currentQuery[key];
    } else if (key == caseList[0]) {
      if (query.adjustingQuery[caseList[0]] == false) {
        newQuery[key] = query.currentQuery[key];
      }
    }
  })

  if (query.adjustingQuery.minDate && !(query.dateAdjusted)) {

    newQuery[caseList[1]] = {$lte: query.dateInfo.maxDate}

  } else if (query.adjustingQuery.maxDate && !(query.dateAdjusted)) {

    newQuery[caseList[1]] = {$gte: query.dateInfo.minDate};

  } else if (query.dateAdjusted) {

    if (query.removeOptions.minDate || query.removeOptions.maxDate) {
      newQuery[caseList[1]] = {$gte: 0};
    }

  }

  if (query.adjustingQuery.sortType) {
    query.removeOptions.sortType = true;
  }

  return newQuery;
}

module.exports.isAdjustingDate = function(query) {

  if (query.minDate || query.maxDate) {
    return true;
  }

  return false;

}

module.exports.getSortOptions = function(query) {
  if (query.adjustingQuery.sortType) {
    return {"date.day": 1, "date.month": 1, "date.year": 1};
  } else {
    return query.sortOptions;
  }
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

// function getDateString(query) {
//   const dateInfo = {
//     day: query.substr(8, 2),
//     month: query.substr(5, 2),
//     year: query.substr(0, 4)
//   }
//
//   return dateInfo;
// }
