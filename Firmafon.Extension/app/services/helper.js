
var helper = {

    formatPhoneNo: function (phoneNo) {

        if (!phoneNo)
            return 'Hidden number';

        return '+' + phoneNo;
    },

    getAccessToken: function (callback) {
        chrome.storage.sync.get(['accessToken'], function (result) {
            let accessToken = result.accessToken;
            callback(accessToken);
        });
    },

    setAccessToken: function (accessToken, callback) {
        chrome.storage.sync.set({ accessToken: accessToken }, callback || function () { });
    },

    formatDate: function (date) {
        var dateString = date.toLocaleDateString();
        var timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
        return dateString + ' ' + timeString;
    },

    formatDuration: function (seconds) {
        var minutes = Math.floor(seconds / 60);
        seconds = seconds - (minutes * 60);

        var hours = Math.floor(minutes / 60);
        minutes = minutes - (hours * 60);

        if (hours > 0) {
            return hours + ' hour(s), ' + minutes + ' min(s)';
        } else if (minutes > 0) {
            return minutes + ' min(s), ' + seconds + ' sec(s)';
        } else {
            return seconds + ' sec(s)';
        }
    },

    saveVoiceMails: function (voiceMails) {
        chrome.storage.local.set({ 'voiceMails': voiceMails }, function () {
            //console.log('Saved to local storage (key: voiceMails)', voiceMails);
        });
    },
    fetchVoiceMails: function (callback) {
        chrome.storage.local.get(['voiceMails'], function (result) {
            callback(result.voiceMails);
        });
    },

    saveRecentCalls: function (recentCalls) {
        chrome.storage.local.set({ 'recentCalls': recentCalls }, function () {
            //console.log('Saved to local storage (key: recentCalls)', recentCalls);
        });
    },
    fetchRecentCalls: function (callback) {
        chrome.storage.local.get(['recentCalls'], function (result) {
            callback(result.recentCalls);
        });
    },

    setBadge: function (text) {
        chrome.browserAction.setBadgeText({ 'text': (text || '').toString() });
        chrome.browserAction.setBadgeBackgroundColor({ 'color': '#000' });
    }

};