$(document).ready(function() {

  var toggleStates = function (elems, dataState, one, two) {
    elems.forEach(elem => {
      var newAttribute = $(elem).attr(dataState) === one? two : one;
      $(elem).attr(dataState, newAttribute);
    });
  };

  window.onresize = function() {
    if (window.innerWidth > 768) {
      $(".expense-description-container").css("display", "block");
      $(".income-description-container").css("display", "block");
    }

    if (window.innerWidth < 768) {
      $(".expense-description-container").css("display", "none");
      $(".income-description-container").css("display", "none");
    }
  }

  $(".close-add-filter").on("click", () => {

    event.stopPropagation();

    $(".close-add-filter").prop("innerHTML") == '<i class="fas fa-plus" aria-hidden="true"></i>' ?
            $(".close-add-filter").html('<i class="fas fa-minus" aria-hidden="true"></i>') :
            $(".close-add-filter").html('<i class="fas fa-plus" aria-hidden="true"></i>');

    toggleStates([".form-section"], "data-toggle", "open", "closed");
  })

  $(".expense-show-container .show-description-button").on("click", () => {
    event.stopPropagation();
    var target = $(event.target).parent().siblings(".expense-description-container");
    target.css("display") == "block" ? target.css("display", "none") : target.css("display", "block");
  });

  $(".income-show-container .show-description-button").on("click", () => {
    event.stopPropagation();
    var target = $(event.target).parent().siblings(".income-description-container");
    target.css("display") == "block" ? target.css("display", "none") : target.css("display", "block");
  });


  $(".show-description-button").on("click", () => {

    event.stopPropagation();

    var target = $(event.target).parent().siblings(".amount-description-container");
    target.css("display") == "block" ? target.css("display", "none") : target.css("display", "block");

  })

  $(".close-current-search").on("click", () => {

    console.log($(".close-current-search").prop("innerHTML") == '<i class="fas fa-plus" aria-hidden="true"></i>');
    event.stopPropagation();

    $(".close-current-search").prop("innerHTML") == '<i class="fas fa-minus" aria-hidden="true"></i>' ?
            $(".close-current-search").html('<i class="fas fa-plus" aria-hidden="true"></i>') :
            $(".close-current-search").html('<i class="fas fa-minus" aria-hidden="true"></i>');
    toggleStates([".current-query-container"], "data-toggle", "open", "closed");
  })

  $(".remove-query-item").toggle("click", () => {
    $(".remove-query-item").css("display", "none");
  })

  $(".change-theme-button").on("click", () => {
    toggleStates(["body", ".navbar-light", ".fa-money-bill-wave", ".change-theme-button", ".navbar-light .nav .nav-link", ".close-forms", ".income-total", ".expense-total", ".index-hr", ".delete-item", ".amount-container", ".form-section input", ".form-section select", "::placeholder"], "data-state", "dark", "light");
    $(".change-theme-button").prop("innerHTML") == `<i class="fas fa-toggle-off" aria-hidden="true"></i>` ?
        $(".change-theme-button").html(`<i class='fas fa-toggle-on' aria-hidden="true"></i>`) :
        $(".change-theme-button").html(`<i class="fas fa-toggle-off" aria-hidden="true"></i>`);
  });

  $(".exit-alert-button").on("click", () => {
    $(".alert").css("display", "none");
  })


})
