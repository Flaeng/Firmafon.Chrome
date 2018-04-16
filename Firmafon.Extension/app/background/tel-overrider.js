
$("body").on("click", "a[href^='tel:']", function (event) {

    //Get phone number
    let url = $(this).attr('href');
    let encodedPhoneNo = url.split('tel:')[1].replace(/%20/g, '');
    let phoneNo = decodeURIComponent(encodedPhoneNo);
    phoneNo = firmafon.formatPhoneNo(phoneNo);

    //Get user confirmation that they wanna call the number
    chrome.runtime.sendMessage({ type: "ga", category: "tel-overrider", action: "confirming call" });
    let confirmed = window.confirm('Do you wanna call ' + phoneNo + ' with Firmafon?');
    if (confirmed) {

        //Get access token and call the number
        helper.getAccessToken(function (token) {
            chrome.runtime.sendMessage({ type: "ga", category: "tel-overrider", action: "calling number" });
            firmafon.call(phoneNo, token, function () {
                alert('Calling: ' + phoneNo);
            });
        });
    } 

    //Prevent default action for tel-links
    event.stopPropagation();
    event.preventDefault();
    return false;

});
