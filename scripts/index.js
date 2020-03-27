//import "../styles/index.scss";
//require.context("../assets/", true, /^\.\/.*\.*/);
$("#loggedIn, #loggedOut").hide();
$("#login").click(ServiceNow.login);
$("#logout").click(function() {
  ServiceNow.logout(checkLogin);
});

window.onload = function() {
  var iframe = document.querySelector("#ext-iframe");
  $(iframe).hide();

  function checkLogin() {
    ServiceNow.isLoggedIn().then(
      function(data) {
        var xhr = new XMLHttpRequest();
        xhr.open(
          "GET",
          ServiceNow.api_url + "chrome_extension.do?sysparm_nostack=true"
        );
        xhr.onreadystatechange = handler;
        xhr.responseType = "blob";
        xhr.setRequestHeader("Authorization", "Bearer " + data.access_token);
        xhr.send();

        function handler() {
          if (this.readyState === this.DONE) {
            if (this.status === 200) {
              debugger;
              iframe.src = ServiceNow.api_url + "extension";
              //$(".loading").hide();
              $(iframe).load(function() {
                $(iframe).show();
              });
            } else {
              console.error("couldnt login");
            }
          }
        }
      },
      function() {
        iframe.src = "login.html";
        // $(".loading").hide();
        $(iframe).load(function() {
          $(iframe).show();
        });
      }
    );
  }

  checkLogin();

  var MessageHandler = {
    getScreenshot: function(deferred) {
      chrome.tabs.captureVisibleTab(
        null,
        { format: "jpeg", quality: 50 },
        function(image) {
          deferred.resolve(image);
        }
      );
    },
    getCurrentUrl: function(deferred) {
      chrome.tabs.getSelected(null, function(tab) {
        deferred.resolve(tab.url);
      });
    },
    logout: function(deferred) {
      ServiceNow.logout();
      deferred.resolve(true);
      top.location.href = "login.html";
    }
  };

  function parseMessage(event) {
    var dfd = jQuery.Deferred();
    var promise = dfd.promise();
    var guid,
      request,
      params = "",
      message_tokens = [],
      message = event.data;
    if (message.length) {
      message_tokens = message.split("^");
      guid = message_tokens[0];
      if (message_tokens.length > 1) {
        request = message_tokens[1];
      }
      if (message_tokens.length > 2) {
        params = message_tokens[2].split(":");
      }
      if (MessageHandler[request]) {
        params.unshift(dfd);
        MessageHandler[request].apply(null, params);
        promise.then(function(data) {
          event.source.postMessage(guid + "^" + data, "*");
        });
      }
    }
  }

  window.onmessage = parseMessage;
};
