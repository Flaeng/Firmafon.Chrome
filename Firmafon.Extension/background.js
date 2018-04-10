
var applicationId = "563eece46fb65c2f735f0d9c7a2215b25469d948e5ae4513193a8b373cc85f52";
var secret = "82d0b0a83fa39ebd32321562e958a9bfeb0e8558a2d70c5840ad8e071fa45651";
var redirectUrl = "http://firmafon-auth-complete";

var fetchAccessTokenUrl = "https://app.firmafon.dk/api/v2/token" +
    "?client_id=" + applicationId +
    "&client_secret=" + secret +
    "&grant_type=authorization_code" +
    "&redirect_uri=" + redirectUrl +
    "&code=";

chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
    var url = details.url;

    //fetch code
    var urlSplit = url.split('?code=');
    var code = urlSplit[1];

    //close current tab
    chrome.tabs.remove(details.tabId);

    //send background request
    var request = new XMLHttpRequest();
    request.onload = function () {
        var json = request.responseText;

        var response = JSON.parse(json);
        var accessToken = response.access_token;

        chrome.storage.sync.set({ accessToken: accessToken }, function () { });
    }
    request.open("POST", fetchAccessTokenUrl + code, true);
    request.send();

}, {
        url: [{
            hostContains: 'firmafon-auth-complete'
        }],
    });


