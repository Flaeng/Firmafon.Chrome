//Trigger Google Analytics
analytics.trackEvent('extension', 'loaded');


//Used to handle firmafon authentication
chrome.webNavigation.onBeforeNavigate.addListener(function (details) {

    //fetch code
    var url = details.url;
    var urlSplit = url.split('?code=');
    var code = urlSplit[1];

    //close current tab
    chrome.tabs.remove(details.tabId);

    //send background request
    analytics.trackEvent('firmafon', 'authenticated');
    firmafon.getAccessTokenFromCode(code, function (token) {
        helper.setAccessToken(token);
        firmafon.initWithFaye(token);
    });

}, {
        url: [{
            hostContains: 'firmafon-auth-complete'
        }]
    });


function calcTotalCallTime(data) {
    firmafon.getCurrentEmployee(function (emp) {
        var callTime = 0;

        var date = new Date();
        var yyyy = date.getFullYear().toString();
        var MM = (date.getMonth() + 1).toString();
        if (MM.length === 1)
            MM = '0' + MM;
        var dd = date.getDate().toString();
        if (dd.length === 1)
            dd = '0' + dd;

        var dateAsText = yyyy + '-' + MM + '-' + dd;

        for (var i = 0; i < data.length; i++) {

            let call = data[i];

            if (call.started_at.indexOf(dateAsText) !== 0)
                break;

            if (call.direction === 'incoming') {
                if (call.endpoint === 'Employee#' + emp.id) {
                    callTime += call.talk_duration;
                } else if (call.answered_by && call.answered_by.id === emp.id) {
                    callTime += call.talk_duration;
                } else {
                    //console.log('incoming call', call);
                }
            } else if (call.direction === 'outgoing') {
                if (call.endpoint === 'Employee#' + emp.id) {
                    callTime += call.talk_duration;
                } else {
                    //console.log('outgoing call', call);
                }
            }
        }
        //console.log('callTime', callTime);
        helper.saveTotalCallTime(callTime);
    });
}

function getRecentCalls(token) {
    firmafon.getRecentCalls(50, function (data) {
        helper.saveRecentCalls(data);
        calcTotalCallTime(data);
    });
}
function getVoiceMails(token) {
    firmafon.getUnheardVoiceMails(20, function (data) {
        helper.saveVoiceMails(data);
        helper.setBadge(data.length);
    });
}


window.onerror = function (message, source, lineno, colno, error) {
    helper.logError(message, source, lineno, colno, error);
};

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


helper.getAccessToken(function (token) {
    if (token) {
        firmafon.initWithFaye(token);
    }
});
