

//Used to handle firmafon authentication
chrome.webNavigation.onBeforeNavigate.addListener(function (details) {

    //fetch code
    var url = details.url;
    var urlSplit = url.split('?code=');
    var code = urlSplit[1];

    //close current tab
    chrome.tabs.remove(details.tabId);

    //send background request
    firmafon.getAccessTokenFromCode(code, function (token) {
        helper.setAccessToken(token);
    });

}, {
        url: [{
            hostContains: 'firmafon-auth-complete'
        }],
    });

function getRecentCalls(token) {
    firmafon.getRecentCalls(function (data) {
        helper.saveRecentCalls(data);
    });
}
function getVoiceMails(token) {
    firmafon.getUnheardVoiceMails(function (data) {
        helper.saveVoiceMails(data);
        //console.log('data', data);
        helper.setBadge(data.length);
    });
}

setInterval(function () {
    tryUpdateLocalData();
}, 10000);
tryUpdateLocalData();

function tryUpdateLocalData() {
    helper.getAccessToken(function (token) {
        if (token) {
            getRecentCalls(token);
            getVoiceMails(token);
        }
    });
}

