var displayed = false;

$(".display-form").on("click", () => {
  if (displayed) {
    displayed = false;
    $(".form-section").css("display", "none");
    $(".display-form").html("<i class='fas fa-minus'></i>");
  } else {
    displayed = true;
    $(".form-section").css("display", "block");
    $(".display-form").html("<i class='fas fa-plus'></i>");
  }
})


$(".remove-query-item").toggle("click", () => {
  $(".remove-query-item").css("display", "none");
})
