module.exports =
{
  portNum: "3007",
  url: 'mongodb://localhost:27017/finances_site',
  searchRetained: false,
  currentQuery : {},
  currentSortOption : "",
  currentTheme : "dark",
  sortOptions: {},
  dateInfo: {
    minDate: {},
    maxDate: {}
  },
  removeOptions: {
    minDate: false,
    maxDate: false,
    sortType: false
  },
  adjustingQuery: {
    type: false,
    minDate: false,
    maxDate: false,
    sortType: false
  },
  dateAdjusted: false,
  resultsPerPage: 10,
  currentPage: 1,
  itemCount: 0
}
