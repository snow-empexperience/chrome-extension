chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method == "getTokens")
    sendResponse({
      access_token: localStorage["access_token"],
      refresh_token: localStorage["refresh_token"]
    });
  else sendResponse({}); // snub them.

  if (request.session) {
    var params = ServiceNow.deparam(request.session);
    if (params.code) {
      debugger;
      ServiceNow.getTokens(params.code);
    } else {
      //console.log(params);
    }
  }
});
