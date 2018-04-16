
var helper = {

    formatPhoneNo: function (phoneNo) {
        //console.log('formatting', phoneNo);
        if (!phoneNo)
            return 'Hidden number';

        return phoneNo.indexOf('00') === -1 ? '+' + phoneNo : phoneNo;
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

    saveTotalCallTime: function (totalCallTime) {
        chrome.storage.local.set({ 'totalCallTime': totalCallTime }, function () {
            //console.log('Saved to local storage (key: voiceMails)', voiceMails);
        });
    },
    fetchTotalCallTime: function (callback) {
        chrome.storage.local.get(['totalCallTime'], function (result) {
            callback(result.totalCallTime);
        });
    },

    setBadge: function (text) {
        chrome.browserAction.setBadgeText({ 'text': (text || '').toString() });
        chrome.browserAction.setBadgeBackgroundColor({ 'color': '#000' });
    },

    logError: function (message, source, lineno, colno, error) {
        analytics.trackError(message, source, lineno, colno, error);
    }

};