$(document).ready(function() {

  var toggleStates = function (elems, one, two) {
    elems.forEach(elem => {
      var newAttribute = $(elem).attr("data-state") === one? two : one;
      $(elem).attr('data-state', newAttribute);
    });
  };

  $("#display-form").on("click", () => {

    // form-section
    event.stopPropagation();
    $(".form-section").toggleClass("show-form")
    // $(event.target).html("<i class='fas fa-minus'></i>");
  })


  $("#display-query-button").on("click", () => {

    // form-section
    event.stopPropagation();
    $(".current-query-container").toggleClass("show-form");
    // $(event.target).html("<i class='fas fa-plus'></i>");
  })



  $(".remove-query-item").toggle("click", () => {
    $(".remove-query-item").css("display", "none");
  })

  $(".change-theme-button").on("click", () => {
    event.stopPropagation();
    $(".change-theme-button").prop("innerHTML") == `<i class="fas fa-toggle-off" aria-hidden="true"></i>` ?
        $(".change-theme-button").html(`<i class='fas fa-toggle-on' aria-hidden="true"></i>`) :
        $(".change-theme-button").html(`<i class="fas fa-toggle-off" aria-hidden="true"></i>`);

    toggleStates(["body", ".navbar-light", ".change-theme-button", ".close-forms", ".income-total", ".expense-total", ".index-hr", ".amount-container", ".form-section input", ".form-section select"], "dark", "light");





    // $("navbar-light").toggleClass("nav-light-style");
    // $(".display-form, #display-form").toggleClass("display-form-light");
  });


})
