$(function() {
  //$("#login").click(ServiceNow.login);
  $("#environment").val(localStorage.getItem("environment"));
  $("#login").click(function(){
    if($("#environment").val()){
      localStorage.setItem("environment", $("#environment").val());
      ServiceNow.login();
    }else{
      $(".error-message").slideDown();
      setTimeout(hideMessage, 3000);
    }
  });
});

function hideMessage() {
  $(".error-message").slideUp()
}
