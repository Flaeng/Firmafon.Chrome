//global
var accessToken = null;
var apiRootPath = "https://app.firmafon.dk/";

function resetApp() {
    chrome.storage.sync.set({ accessToken: null }, function (result) {
        init();
    });
}
function closeExtensionWindow() {
    chrome.tabs.getCurrent(function (currentTab) {
        if (currentTab)
            chrome.tabs.remove(currentTab.id);
    });
}

//login-form
var applicationId = "563eece46fb65c2f735f0d9c7a2215b25469d948e5ae4513193a8b373cc85f52";
var redirectUrl = "http://firmafon-auth-complete";
var authorizeLink = "https://app.firmafon.dk/api/v2/authorize" +
    "?client_id=" + applicationId +
    "&response_type=code" +
    "&redirect_uri=" + redirectUrl;

function initWithAccessToken(token) {

    var url = apiRootPath + 'api/v2/employee?access_token=' + accessToken;

    $.get(url, function (data) {
        console.log('employee', data);

        var employeeShortName = data.employee.name.split(' ')[0];
        $(".employee-name").html(employeeShortName);
    })
        .fail(function (data) {
            console.log('got error', data);
            if (data.status == 401) {
                resetApp();
            }
        });
}


function init() {
    chrome.storage.sync.get(['accessToken'], function (result) {
        console.log("accessToken", result);
        accessToken = result.accessToken;

        console.log('got token', accessToken);
        if (accessToken) {
            $("#call-section").css("display", "block");
            $("#login-section").css("display", "none");
            initWithAccessToken(accessToken);
            fetchLastestCalls();
            fetchVoiceMails();
        } else {
            $("#call-section").css("display", "none");
            $("#login-section").css("display", "block");
        }
    });
}
init();

$(".authorize-button").click(function () {
    chrome.tabs.create({ url: authorizeLink });
    closeExtensionWindow();
});


//call-form

$("#call-form").submit(function (e) {
    e.preventDefault();

    var phoneNo = $("#call-number").val();
    call(phoneNo);
});

$(".signout-button").click(function () {
    resetApp();
});

function fetchVoiceMails() {

    var url = apiRootPath + 'api/v2/voice_mails?limit=20&access_token=' + accessToken;

    $.get(url, function (data) {
        console.log('voice-mails', data);

        var voiceMails = $("#voice-mails");
        var toNumber = [];

        var numberOfUnheard = 0;

        for (var i = 0; i < data.voice_mails.length && i < 5; i++) {
            let callItem = data.voice_mails[i];

            if (callItem.header)
                numberOfUnheard++;

            let item = $("<div>");
            item.attr('class', 'voicemail-item list-item');

            let anchorText = 'Unknown (+' + callItem.from_number + ')';
            if (callItem.from_contact && callItem.from_contact.name) {
                anchorText = callItem.from_contact.name;
            }
            let date = new Date(callItem.created_at);
            //console.log('date', date);
            item.html('<b>' + anchorText + '</b><br /><small>' + formatDate(date) + '</small>');


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
            callbackAnchor.html('<i class="fa fa-phone"></i> +' + callItem.from_number_formatted);
            callbackAnchor.appendTo(item);
            
            voiceMails.append(item);
        }
        voiceMails.show();

        if (numberOfUnheard == 0)
            chrome.browserAction.setBadgeText({ text: '' });
        else
            chrome.browserAction.setBadgeText({ text: numberOfUnheard.toString() });

    })
        .fail(function (data) {
            console.log('got error', data);
        });
}

function formatDate(date) {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().replace(/\./g, ':');
}

function fetchLastestCalls() {
    
    var url = apiRootPath + 'api/v2/calls?limit=20&access_token=' + accessToken;

    $.get(url, function (data) {
        console.log('calls', data);

        var latestCalls = $("#latest-calls");
        var toNumber = [];

        for (var i = 0; i < data.calls.length; i++) {
            let callItem = data.calls[i];

            let isIngoing = callItem.direction === 'incoming';

            let contact = isIngoing ? callItem.from_contact : callItem.to_contact;
            let number = (isIngoing ? callItem.from_number : callItem.to_number).toString();
            let numberFormatted = isIngoing ? callItem.from_number_formatted : callItem.to_number_formatted;
            let email = isIngoing ? callItem.from_contact.email : callItem.to_contact.email;
            //console.log('contact', contact);

            if (toNumber.length == 5)
                break;
            if (toNumber.indexOf(number) != -1)
                continue;
            else
                toNumber.push(number);

            console.log('call', callItem);

            let item = $("<div>");
            item.attr('class', 'call-item list-item');

            let anchorText = (contact && contact.name) ? contact.name : 'Unknown';
            let date = new Date(callItem.started_at);
            item.html('<b>' + anchorText + '</b><br /><small>' + formatDate(date) + '</small>');


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

    })
        .fail(function (data) {
            console.log('got error', data);
        });
}

function mailto(email) {
    console.log('mailto', email);
    chrome.tabs.create({ url: 'mailto:' + email });
}


//helpers

//function post(url, data, callback) {
//    var request = new XMLHttpRequest();
//    request.onload = function () {
//        var json = request.responseText;
//        console.log('json', json);
//        var response = JSON.parse(json);
//        callback(response);
//    }
//    request.open("POST", url, true);
//    request.send(data);
//}

function call(phoneNo) {
    if (phoneNo.length == 8)
        phoneNo = "45" + phoneNo;

    var url = apiRootPath + "api/v2/switch/dial?to_number=" + phoneNo + "&access_token=" + accessToken;
    console.log("url", url);
    //$.post(url)
    //    .success(function () {
    //        console.log('http post done');
    //          closeExtensionWindow();
    //    });
    closeExtensionWindow();
}