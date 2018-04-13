
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

    call: function (phoneNo, accessToken, callback) {
        let url = apiRootPath + "api/v2/switch/dial?to_number=" + phoneNo + "&access_token=" + accessToken;
        console.log('POST', url);
        jQuery.post(url, null, callback);
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
var notificationsOptions = {
    type: 'basic',
    iconUrl: '../logo.png'
};

function initFaye(token, employeeId, companyId) {
    //console.log('initFaye token', token);
    //console.log('initFaye employeeId', employeeId);
    //console.log('initFaye companyId', companyId);

    chrome.notifications.onClicked.addListener(chrome.notifications.clear);

    var client = new Faye.Client('https://pubsub.firmafon.dk/faye');
    //Faye.logger = window.console;
    
    client.addExtension({
        outgoing: function (message, callback) {
            message.ext = { app: 'Firmafon Chrome Extension', access_token: token };
            callback(message);
        }
    });

    function handleCall(call) {
        if (call.direction === 'incoming') {
            switch (call.status) {

                case 'new':
                    var options = notificationsOptions;
                    $.extend(options, {
                        title: 'Incoming call from',
                        message: call.endpoint_name + '\n' + call.from_number,
                    })
                    chrome.notifications.create(call.call_uuid, options);
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

    //handleCall({
    //    "call_uuid": "c1159322-3e82-11e8-867e-ed7ff40728d9",
    //    "company_id": "6917",
    //    "endpoint": "Employee#20621",
    //    "started_at": "2018-04-12T18:53:14Z",
    //    "from_number": "4528972584",
    //    "to_number": "4522755229",
    //    "direction": "incoming",
    //    "status": "new",
    //    "from_number_hidden": "false",
    //    "endpoint_name": "Dennis Flæng Jørgensen",
    //    "switch": "b15",
    //    "a_leg_session_uuid": "c10c065e-3e82-11e8-8653-ed7ff40728d9"
    //});

    client.subscribe('/call2/employee/' + employeeId, function (message) {
        //console.log('/call2/employee/' + employeeId, message);

        var data = message.data;
        handleCall(data);
    });
}
