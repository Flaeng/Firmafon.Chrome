﻿
let apiRootPath = "https://app.firmafon.dk/";
let applicationId = "563eece46fb65c2f735f0d9c7a2215b25469d948e5ae4513193a8b373cc85f52";
let secret = "82d0b0a83fa39ebd32321562e958a9bfeb0e8558a2d70c5840ad8e071fa45651";
let redirectUrl = "http://firmafon-auth-complete";

let fetchAccessTokenUrl = "https://app.firmafon.dk/api/v2/token" +
    "?client_id=" + applicationId +
    "&client_secret=" + secret +
    "&grant_type=authorization_code" +
    "&redirect_uri=" + redirectUrl +
    "&code=";

var authorizeLink = "https://app.firmafon.dk/api/v2/authorize" +
    "?client_id=" + applicationId +
    "&response_type=code" +
    "&redirect_uri=" + redirectUrl;

var firmafon = {

    accessToken: null,

    init: function (token) {
        this.accessToken = token;
    },

    initWithFaye: function (token) {
        this.init(token);

        this.getCurrentEmployee(function (employee) {
            var companyId = employee.company_id;
            initFaye(token, employee.id, companyId);
        });
    },

    formatPhoneNo: function (phoneNo) {
        phoneNo = phoneNo.replace(/ /g, '');
        phoneNo = phoneNo.replace("+", "00");
        if (phoneNo.indexOf('00') != 0 && phoneNo.length == 8) {
            phoneNo = "45" + phoneNo;
        }
        return phoneNo;
    },

    call: function (phoneNo, accessToken, callback) {
        let url = apiRootPath + "api/v2/switch/dial?to_number=" + this.formatPhoneNo(phoneNo) + "&access_token=" + accessToken;
        console.log('POST', url);
        //jQuery.post(url, null, callback);
    },

    authenticate: function () {

    },

    getAccessTokenFromCode: function (code, callback) {
        let url = fetchAccessTokenUrl + code;
        console.log('POST', url);
        jQuery.post(url, null, function (response) {
            let accessToken = response.access_token;
            this.accessToken = accessToken;
            console.log('got access token', accessToken);
            callback(accessToken);
            tryUpdateLocalData();
        });
    },

    getCurrentEmployee: function (callback) {
        var url = apiRootPath + 'api/v2/employee?access_token=' + this.accessToken;
        jQuery.get(url, function (data) {
            //console.log('employee', data.employee);
            callback(data.employee);
        });
    },

    getUnheardVoiceMails: function (limit, callback) {
        var url = apiRootPath + 'api/v2/voice_mails?limit=' + limit + '&access_token=' + this.accessToken;
        jQuery.get(url, function (data) {
            var vMails = $.grep(data.voice_mails, function (elem) {
                return !elem.heard;
            });
            //console.log('vMails', vMails);
            callback(vMails);
        });
    },

    getRecentCalls: function (limit, callback) {
        var url = apiRootPath + 'api/v2/calls?limit=' + limit + '&access_token=' + this.accessToken;
        jQuery.get(url, function (data) {
            callback(data.calls);
        });
    },

};


//Notifications
var notificationsOptions = {
    type: 'basic',
    iconUrl: '../logo.png'
};
function handleCall(call) {
    if (call.direction === 'incoming') {
        switch (call.status) {

            case 'new':
                var options = notificationsOptions;
                $.extend(options, {
                    title: 'Incoming call from',
                    message: call.endpoint_name + '\n' + helper.formatPhoneNo(call.from_number),
                })
                chrome.notifications.create(call.call_uuid, options);
                animateCall(3);
                break;

            case 'answered':
            case 'missed':
            case 'voicemail':
            case 'orphaned':
                chrome.notifications.clear(call.call_uuid, function () { });
                break;

        }

    }
}

var animationInterval = 100;
function animateCall(numberOfCycles) {
    if (numberOfCycles == 0)
        return;

    setTimeout(function () {
        helper.setBadge('____C');

        setTimeout(function () {
            helper.setBadge('___CA');

            setTimeout(function () {
                helper.setBadge('__CAL');

                setTimeout(function () {
                    helper.setBadge('_CALL');

                    setTimeout(function () {
                        helper.setBadge('CALL_');

                        setTimeout(function () {
                            helper.setBadge('ALL__');

                            setTimeout(function () {
                                helper.setBadge('LL___');

                                setTimeout(function () {
                                    helper.setBadge('L____');

                                    setTimeout(function () {
                                        helper.setBadge('_____');

                                        numberOfCycles--;
                                        if (numberOfCycles == 0)
                                            helper.setBadge('');
                                        else 
                                            animateCall(numberOfCycles);

                                    }, animationInterval);
                                }, animationInterval);
                            }, animationInterval);
                        }, animationInterval);
                    }, animationInterval);
                }, animationInterval);
            }, animationInterval);
        }, animationInterval);
    }, animationInterval);
}

function initFaye(token, employeeId, companyId) {
    chrome.notifications.onClicked.addListener(chrome.notifications.clear);

    var client = new Faye.Client('https://pubsub.firmafon.dk/faye');

    client.addExtension({
        outgoing: function (message, callback) {
            message.ext = { app: 'Firmafon Chrome Extension', access_token: token };
            callback(message);
        }
    });

    client.subscribe('/call2/employee/' + employeeId, function (message) {
        var data = message.data;
        handleCall(data);
    });
}
