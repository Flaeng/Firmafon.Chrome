
var anchors = document.getElementsByTagName("a");

for (var i = 0; i < anchors.length; i++) {
    var anchor = anchors[i];

    anchor.onclick = function (ev) {
        //console.log('click', ev);
        handleTel(ev.target);
        return false;
    }
}

function handleTel(anchorTag) {
    var url = anchorTag.href;
    var encodedPhoneNo = url.split('tel:')[1].replace(/%20/g, '');
    var phoneNo = decodeURIComponent(encodedPhoneNo);

    console.log('phoneNo', phoneNo);

    chrome.storage.sync.get(['accessToken'], function (result) {
        console.log("accessToken", result);
        var accessToken = result.accessToken;

        if (accessToken)
            call(phoneNo, accessToken);
    });
}

var apiRootPath = "https://app.firmafon.dk/";
function call(phoneNo, accessToken) {

    var url = apiRootPath + "api/v2/switch/dial?to_number=" + phoneNo + "&access_token=" + accessToken;
    console.log("url", url);


    //var request = new XMLHttpRequest();
    //request.open("POST", url, true);
    //request.send();

    alert('Calling: ' + phoneNo);
}