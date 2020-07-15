$(document).ready(function() {

  var toggleStates = function (elems, dataState, one, two) {
    elems.forEach(elem => {
      var newAttribute = $(elem).attr(dataState) === one? two : one;
      $(elem).attr(dataState, newAttribute);
    });
  };

  $(".close-add-filter").on("click", () => {

    event.stopPropagation();

    $(".close-add-filter").prop("innerHTML") == '<i class="fas fa-plus" aria-hidden="true"></i>' ?
            $(".close-add-filter").html('<i class="fas fa-minus" aria-hidden="true"></i>') :
            $(".close-add-filter").html('<i class="fas fa-plus" aria-hidden="true"></i>');

    toggleStates([".form-section"], "data-toggle", "open", "closed");
  })

  $(".close-current-search").on("click", () => {

    event.stopPropagation();
    console.log($(event.target).parent().prop("innerHTML"))

    $(event.target).parent().prop("innerHTML") == '<i class="fas fa-minus" aria-hidden="true"></i>' ?
            $(event.target).parent().html('<i class="fas fa-plus" aria-hidden="true"></i>') :
            $(event.target).parent().html('<i class="fas fa-minus" aria-hidden="true"></i>');
    toggleStates([".current-query-container"], "data-toggle", "open", "closed");
  })



  $(".remove-query-item").toggle("click", () => {
    $(".remove-query-item").css("display", "none");
  })

  $(".change-theme-button").on("click", () => {

    toggleStates(["body", ".navbar-light", "#logo-icon", ".change-theme-button", ".navbar-light .nav .nav-link", ".close-forms", ".income-total", ".expense-total", ".index-hr", ".amount-container", ".form-section input", ".form-section select"], "data-state", "dark", "light");
    $(".change-theme-button").prop("innerHTML") == `<i class="fas fa-toggle-off" aria-hidden="true"></i>` ?
        $(".change-theme-button").html(`<i class='fas fa-toggle-on' aria-hidden="true"></i>`) :
        $(".change-theme-button").html(`<i class="fas fa-toggle-off" aria-hidden="true"></i>`);
  });


})
