
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

    call: function (phoneNo, accessToken, callback) {

        let url = apiRootPath + "api/v2/switch/dial?to_number=" + phoneNo + "&access_token=" + accessToken;
        console.log('POST', url);
        //$http.post(url, null, callback);
    },
    
    authenticate: function () {

    },

    getAccessTokenFromCode: function (code, callback) {
        let url = fetchAccessTokenUrl + code;
        console.log('POST', url);
        $http.post(url, null, function (response) {
            let accessToken = response.access_token;
            this.accessToken = accessToken;
            callback(accessToken);
            tryUpdateLocalData();
        });
    },

    getCurrentEmployee: function (callback) {
        var url = apiRootPath + 'api/v2/employee?access_token=' + this.accessToken;
        $.get(url, function (data) {
            callback(data.employee);
        });
    },

    getUnheardVoiceMails: function (callback) {
        var url = apiRootPath + 'api/v2/voice_mails?limit=50&access_token=' + this.accessToken;
        jQuery.get(url, function (data) {
            var vMails = $.grep(data.voice_mails, function (elem) {
                return !elem.heard;
            });
            //console.log('vMails', vMails);
            callback(vMails);
        });
    },

    getRecentCalls: function (callback) {
        var url = apiRootPath + 'api/v2/calls?limit=20&access_token=' + this.accessToken;
        jQuery.get(url, function (data) {
            callback(data.calls);
        });
    },
    
};



//Notifications
function initFaye() {
    var client = new Faye.Client('https://pubsub.firmafon.dk/faye');
    client.subscribe('/call.new', function (call) {
        console.log('call.new', call);
        var options = {
            type: 'basic',
            title: 'Incoming call',
            message: call.data.from_number
        };
        chrome.notifications.create(call.data.call_uuid, options);
    });

    client.subscribe('/call.answer', function (call) {
        console.log('call.answer', call);
        chrome.notifications.clear(call.data.call_uuid);
    });
}

var d = document.createElement("script");
d.setAttribute('src', "https://pubsub.firmafon.dk/faye/client.js");
d.onload = initFaye;
document.body.appendChild(d);
