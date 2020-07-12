$(document).ready(function() {


  $("#display-form").on("click", () => {

    // form-section
    event.stopPropagation();
    $(".form-section").toggleClass("show-form")
    // $(event.target).html("<i class='fas fa-minus'></i>");
  })


  $("#display-query-button").on("click", () => {

    // form-section
    event.stopPropagation();
    $(".current-query-container").css("background-color", "red");
    $(".current-query-container").toggleClass("show-form");
    // $(event.target).html("<i class='fas fa-plus'></i>");
  })



  $(".remove-query-item").toggle("click", () => {
    $(".remove-query-item").css("display", "none");
  })



})
