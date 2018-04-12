
window.ga_debug = { trace: true };

//console.log('Init GA');
//window.ga = window.ga || function () { (ga.q = ga.q || []).push(arguments) }; ga.l = +new Date;
ga('create', 'UA-117407821-1', 'auto');
ga('set', 'checkProtocolTask', function () { /* nothing */ });
//ga('set', 'viewportSize', 'extension-window');
//ga('set', 'timingTask', function () { return true; });
//ga('send', 'pageview');



var analytics = {

    trackEvent: function (category, action) {
        action = action || 'clicked';
        ga('send', 'event', category, action);
    },

    trackPageView: function () {
        ga('send', 'pageview');
    }

}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type == "ga") {
        analytics.trackEvent(request.category, request.action);
    }
});