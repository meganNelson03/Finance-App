

module.exports.formattedDate = function() {
  var date = new Date();
  return date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + "-" + ('0' + date.getDate()).slice(-2);
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

module.exports.createQueryObj = function(query, value, caseList) {

  let newQuery = {};

  Object.getOwnPropertyNames(query).forEach(key => {

    if (query[key] != "none") {
      caseList.forEach(item => {
        if (item.includes(key)) {
          newQuery[item] = query[key];
        }
      });
    }

  });

  return newQuery;
}
