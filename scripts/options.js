function saveOption() {
  localStorage.setItem("environment", $("#environment").val());
  $(".message").slideDown();
  setTimeout(hideMessage, 2000);
}

function hideMessage() {
  $(".message").slideUp();
}

$(function() {
  $("#environment").val(ServiceNow.environment);
  $(".message").hide();
  $("#saveBtn").click(saveOption);
});
