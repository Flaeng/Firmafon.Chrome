
app.controller('MainController', ['$scope', '$rootScope', function ($scope, $rootScope) {

    $scope.toggleSettings = function () {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    };

    function initAsAuthenticated(accessToken) {
        firmafon.getCurrentEmployee(function (employee) {

            $rootScope.currentEmployee = employee;
            if (!employee) {
                //If employee is null, token has expired - reset app
                $rootScope.resetApp();
            }
            $scope.$apply();
        });
    }

    helper.getAccessToken(function(accessToken) {
        if (accessToken) {
            $rootScope.isLoggedIn = true;
            initAsAuthenticated(accessToken);
            firmafon.init(accessToken);
        } else {
            $rootScope.currentEmployee = null;
            $rootScope.isLoggedIn = false;
        }
        $scope.$apply();
    });

    $scope.makeCall = function (phoneNo) {
        analytics.trackEvent('popup', 'calling number');
        firmafon.call(phoneNo, function () {
            closeExtensionWindow();
        });
    };

    $scope.mailTo = function (email, subject, text) {

        let url = (email || '') + '?';

        subject = (subject || '').toString();
        if (subject.length !== 0)
            url += 'subject=' + encodeURI(subject) + '&';

        text = (text || '').toString();
        if (text.length !== 0)
            url += 'body=' + encodeURI(text) + '&';

        analytics.trackEvent('popup', 'using mailto contact');
        chrome.tabs.create({ url: 'mailto:' + url });
    };

}]);

app.controller('WelcomeController', ['$scope', '$rootScope', function ($scope, $rootScope) {

    helper.fetchTotalCallTime(function (duration) {
        $scope.$apply(function () {
            $scope.totalCallTime = duration;
        });
    });


}]);

app.controller('LoginController', ['$scope', '$rootScope', function ($scope, $rootScope) {

    $scope.authenticate = function () {
        analytics.trackEvent('firmafon', 'authenticating');
        firmafon.authenticate();
        closeExtensionWindow();
    };

}]);

app.controller('SettingsController', ['$scope', '$rootScope', function ($scope, $rootScope) {

    $scope.signOut = $rootScope.resetApp;

    helper.fetchRules(function (rules) {
        $scope.rules = rules || [];
        $scope.$apply();
    });

    function save() {
        helper.saveRules($scope.rules);
    }

    $scope.newRule = function () {
        $scope.rules.push({
            no: $scope.rules.length + 1,
            name: 'Rule #' + ($scope.rules.length + 1)
        });
    };

    $scope.deleteRule = function (rule) {
        var index = $scope.rules.indexOf(rule);
        $scope.rules.splice(index, 1);
        save();
    };

}]);

app.controller('CallController', ['$scope', '$rootScope', function ($scope, $rootScope) {

    $scope.call = function () {
        let phoneNo = $scope.phoneNumber;
        $scope.makeCall(phoneNo);
    };


}]);

app.controller('VoiceMailController', ['$scope', '$rootScope', function ($scope, $rootScope) {

    helper.fetchVoiceMails(function (voiceMails) {
        //console.log('voiceMails', voiceMails);
        $scope.items = voiceMails;
        $scope.$apply();
    });

}]);

app.controller('RecentCallsController', ['$scope', '$rootScope', '$filter', function ($scope, $rootScope, $filter) {

    helper.fetchRecentCalls(function (calls) {
        $.each(calls, function (i, elem) {
            if (elem.direction === 'outcoming') {
                elem.contact = elem.to_contact;
                elem.number = elem.to_number;
            } else {
                elem.contact = elem.from_contact;
                elem.number = elem.from_number;
            }
        });
        console.log('calls', calls);
        $scope.items = calls;
        $scope.$apply();
    });

    $scope.mailBusinessCard = function (contact) {
        console.log('contact', contact);
        let text = contact.name + '\n' +
            contact.number_formatted + '\n' +
            contact.email;
        $scope.mailTo(null, null, text);
    };

}]);

analytics.trackEvent('popup', 'opened');
analytics.trackPageView();


window.onerror = function (message, source, lineno, colno, error) {
    helper.logError(message, source, lineno, colno, error);
};

