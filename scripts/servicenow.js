(function() {
  var env = localStorage.getItem("environment");
  /*if (!env || env == "") {
    env = "taksh";
    localStorage.setItem("environment", env);
  }*/
  var API_URL = "https://" + env + ".service-now.com/";
  var client_id = "1afecf6ade5b0450b9dcf4f982c02b7e";
  var client_secret = "(o@Ox95^o}";
  var redirect_uri = "https://app.getpostman.com/oauth2/callback"; //chrome.identity.getRedirectURL();
  //var redirect_uri = API_URL + "extension"; //chrome.identity.getRedirectURL();
  var ServiceNow = {
    environment: env,
    api_url: API_URL,
    access_token: null,
    login: function() {
      //open the window with login
      env = localStorage.getItem("environment");
      API_URL = "https://" + env + ".service-now.com/";

      var url =
        API_URL +
        "oauth_auth.do?response_type=code&redirect_uri=" +
        redirect_uri +
        "&client_id=" +
        client_id +
        "&state=random";
      window.open(url);
    },
    logout: function(cb) {
      ServiceNow.access_token = false;
      ServiceNow.refresh_token = false;
      chrome.storage.local.remove(["access_token", "refresh_token"], cb);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
    getTokens: function(code) {
      return $.ajax({
        url: API_URL + "oauth_token.do",
        type: "POST",
        data: {
          grant_type: "authorization_code",
          //grant_type: "client_credentials",
          client_id: client_id,
          redirect_uri: redirect_uri,
          code: code,
          scope: "useraccount"
        },
        headers: {
          Authorization: "Basic " + btoa(client_id + ":" + client_secret)
        },
        success: function(data, textStatus, request) {
          ServiceNow.setOAuthTokens(data);
        },
        error: function() {
          ServiceNow.login();
        }
      });
    },
    isLoggedIn: function() {
      //check if there is an access token and refresh token
      //if yes, then try to get a new access token
      //if not then reject
      var dfd = jQuery.Deferred();

      var checkTokens = function(result, dfd) {
        if (result.access_token && result.refresh_token) {
          var do_check = true;
          //check the time the last token was received
          //check that at least 1 day has passed since the refresh token
          if (
            result.expires_in &&
            result.token_generation_time &&
            !isNaN(parseInt(result.expires_in, 10))
          ) {
            var now = moment();
            var token_generation_time = moment(result.token_generation_time);
            var has_valid_token =
              now.diff(token_generation_time, "seconds") <
              parseInt(result.expires_in, 10);
            if (has_valid_token) {
              setTimeout(function() {
                dfd.resolve(result);
              }, 10);
              do_check = false;
            } else {
              do_check = true;
            }
          }
          if (do_check) {
            console.info("checking token");
            $.ajax({
              url: API_URL + "oauth_token.do",
              type: "POST",
              data: {
                grant_type: "refresh_token",
                client_id: client_id,
                redirect_uri: redirect_uri,
                refresh_token: result.refresh_token,
                scope: "useraccount"
              },
              headers: {
                Authorization: "Basic " + btoa(client_id + ":" + client_secret)
              },
              success: function(data) {
                ServiceNow.setOAuthTokens(data);
                dfd.resolve(data);
              },
              error: function() {
                console.error("invalid login");
                dfd.reject(false);
              }
            });
          }
        } else {
          setTimeout(function() {
            dfd.reject(false);
          }, 100);
        }
      };

      if (chrome.storage) {
        chrome.storage.local.get(
          [
            "access_token",
            "refresh_token",
            "token_generation_time",
            "expires_in"
          ],
          function(result) {
            checkTokens(result, dfd);
          }
        );
      } else {
        var result = {
          access_token: localStorage.getItem("access_token"),
          refresh_token: localStorage.getItem("refresh_token"),
          token_generation_time: localStorage.getItem("token_generation_time"),
          expires_in: localStorage.getItem("expires_in")
        };
        checkTokens(result, dfd);
      }
      return dfd.promise();
    },
    setOAuthTokens: function(tokens, cb) {
      ServiceNow.access_token = tokens.access_token;
      ServiceNow.refresh_token = tokens.refresh_token;
      var token_generation_time = moment().format();
      chrome.storage.local.set(
        {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_generation_time: token_generation_time,
          expires_in: tokens.expires_in
        },
        cb
      );
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      localStorage.setItem("expires_in", tokens.expires_in);
      localStorage.setItem("token_generation_time", token_generation_time);
    },
    deparam: function(params) {
      var obj = {};
      $.each(params.split("&"), function() {
        var item = this.split("=");
        obj[item[0]] = item[1];
      });
      return obj;
    }
  };

  window.ServiceNow = ServiceNow;
})();
