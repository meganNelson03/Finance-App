module.exports =
{
  portNum: "3005",
  url: 'mongodb://localhost:27017/finances_site',
  currentQuery : {},
  currentSortOption : "",
  sortOptions: {},
  dateInfo: {
    minDate: {},
    maxDate: {}
  },
  removeOptions: {
    minDate: false,
    maxDate: false
  },
  adjustingQuery: {
    type: false,
    minDate: false,
    maxDate: false,
    adjustedDate: false
  }

}
