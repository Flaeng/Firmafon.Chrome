//var app = angular.module('FirmafonExtension', []);

//app.controller('MainController', function () {

//});

//app.controller('LoginController', function () {
//    //console.log('Now you login');
//});

//app.controller('CallController', function () {
//    //console.log('Now you call people');
//});

//app.controller('VoiceMailController', function () {
//    //console.log("Here's your voicemails");
//});

//app.controller('RecentCallsController', function () {
//    //console.log("Here's your recent calls");
//});

analytics.trackEvent('popup', 'opened');
analytics.trackPageView();

//global
var accessToken = null;

function resetApp() {
    analytics.trackEvent('firmafon', 'dropping token');
    helper.setAccessToken(null, init);
}
function closeExtensionWindow() {
    chrome.tabs.getCurrent(function (currentTab) {
        if (currentTab)
            chrome.tabs.remove(currentTab.id);
    });
}

//login-form
function initWithAccessToken(token) {

    firmafon.getCurrentEmployee(function (employee) {

        if (employee) {
            //Display users name
            var employeeShortName = employee.name.split(' ')[0];
            $(".employee-name").html(employeeShortName);
        } else {
            //If employee is null, token has expired - reset app
            resetApp();
        }
    });
}
function init() {
    helper.getAccessToken(function (accessToken) {
        
        if (accessToken) {
            $("#call-section").css("display", "block");
            $("#login-section").css("display", "none");
            initWithAccessToken(accessToken);
            fetchLastestCalls();
            fetchVoiceMails();
            $("#call-number").focus();
        } else {
            $("#call-section").css("display", "none");
            $("#login-section").css("display", "block");
        }
    });
}
init();

$(".authorize-button").click(function () {
    analytics.trackEvent('firmafon', 'authenticating');
    chrome.tabs.create({ url: authorizeLink });
    closeExtensionWindow();
});


//call-form

$("#call-form").submit(function (e) {
    analytics.trackEvent('popup', 'calling number');
    e.preventDefault();

    var phoneNo = $("#call-number").val();
    call(phoneNo);
    closeExtensionWindow();
});

$(".signout-button").click(function () {
    resetApp();
});

function fetchVoiceMails() {

    helper.fetchVoiceMails(function (voice_mails) {

        var voiceMails = $("#voice-mails");
        
        voiceMails.empty();

        for (var i = 0; i < voice_mails.length && i < 5; i++) {
            let callItem = voice_mails[i];
            
            let item = $("<div>");
            item.attr('class', 'voicemail-item list-item');

            let anchorText = 'Unknown (' + helper.formatPhoneNo(callItem.from_number) + ')';
            if (callItem.from_contact && callItem.from_contact.name) {
                anchorText = callItem.from_contact.name + '(+' + callItem.from_number + ')';
            }
            let date = new Date(callItem.created_at);
            item.html('<b>' + anchorText + '</b><br /><small>' + helper.formatDate(date) + '</small>');


            let listenAnchor = $("<a>");
            listenAnchor.addClass('display-block');
            listenAnchor.click(function () {
                chrome.tabs.create({ url: callItem.sound.url });
            });
            listenAnchor.html('<i class="fa fa-phone-square"></i> Listen to voicemail');
            listenAnchor.appendTo(item);

            let callbackAnchor = $("<a>");
            callbackAnchor.addClass('display-block');
            callbackAnchor.click(function () {
                call(callItem.from_number);
            });
            callbackAnchor.html('<i class="fa fa-phone"></i> ' + callItem.from_number_formatted);
            callbackAnchor.appendTo(item);

            voiceMails.append(item);
        }

        if (voice_mails.length == 0) {
            voiceMails.html("You've heard all your voicemails");
        }
        voiceMails.show();
    });
}



function fetchLastestCalls() {
    helper.fetchRecentCalls(function (data) {

        var latestCalls = $("#latest-calls");
        var toNumber = [];

        for (var i = 0; i < data.length; i++) {
            let callItem = data[i];

            console.log('callItem', callItem);

            let isIngoing = callItem.direction === 'incoming';

            let contact = isIngoing ? callItem.from_contact : callItem.to_contact;
            let number = helper.formatPhoneNo(isIngoing ? callItem.from_number : callItem.to_number);
            let numberFormatted = isIngoing ? callItem.from_number_formatted : callItem.to_number_formatted;
            let email = isIngoing ? callItem.from_contact.email : callItem.to_contact.email;
            //console.log('contact', contact);

            if (toNumber.length == 5)
                break;
            //if (toNumber.indexOf(number) != -1)
                //continue;
            else
                toNumber.push(number);

            //console.log('call', callItem);

            let item = $("<div>");
            item.attr('class', 'call-item list-item');

            let anchorText = (contact && contact.name) ? contact.name : 'Unknown';
            let date = new Date(callItem.started_at);
            let status = callItem.status == 'ringing' || callItem.status == 'answered' ?
                callItem.direction :
                callItem.status == 'orphaned' ? 
                    'missed' :
                    callItem.status;

            item.html('<b>' + anchorText + '</b><br /><small>' + helper.formatDate(date) + ' - ' + status + ' - ' + helper.formatDuration(callItem.talk_duration) + '</small>');


            let telAnchor = $("<a>");
            telAnchor.addClass('display-block');
            telAnchor.click(function () {
                call(number);
            });
            telAnchor.html('<i class="fa fa-phone"></i> ' + numberFormatted);
            telAnchor.appendTo(item);

            if (email) {
                let mailtoAnchor = $("<a>");
                mailtoAnchor.addClass('display-block');
                mailtoAnchor.click(function () {
                    mailto(email);
                });
                mailtoAnchor.html('<i class="fa fa-envelope"></i> ' + email);
                mailtoAnchor.appendTo(item);
            }

            latestCalls.append(item);
        }
        latestCalls.show();
    });
}

function mailto(email) {
    analytics.trackEvent('popup', 'using mailto contact');
    console.log('mailto', email);
    chrome.tabs.create({ url: 'mailto:' + email });
}


//helpers
function call(phoneNo) {
    firmafon.call(phoneNo, accessToken, function () {
        closeExtensionWindow();
    });
}