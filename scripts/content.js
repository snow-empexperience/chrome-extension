chrome.runtime.sendMessage(
  { type: "auth", session: window.location.search.substr(1) },
  function(response) {
    try {
      window.open("", "_self", "");
      window.close();
    } catch (e) {}
  }
);

chrome.runtime.sendMessage({ method: "getTokens" }, function(response) {
  for (var k in response) {
    localStorage.setItem(k, response[k]);
  }
});
