
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
        });
    },
    fetchTotalCallTime: function (callback) {
        chrome.storage.local.get(['totalCallTime'], function (result) {
            callback(result.totalCallTime);
        });
    },

    saveRules: function (rules) {
        chrome.storage.local.set({ 'rules': rules }, function () {
        });
    },
    fetchRules: function (callback) {
        chrome.storage.local.get(['rules'], function (result) {
            callback(result.rules);
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