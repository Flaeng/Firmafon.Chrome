var app = angular.module('FirmafonExtension', [])
    .config(function () {

    })
    .run(['$rootScope', function ($rootScope) {

        $rootScope.currentEmployee = null;

        $rootScope.resetApp = function () {
            analytics.trackEvent('firmafon', 'dropping token');
            helper.setAccessToken(null, function () {
                $rootScope.currentEmployee = null;
                $rootScope.isLoggedIn = false;
                $rootScope.$apply();
            });
        };

        $rootScope.closeExtensionWindow = function () {
            window.close();
        };

    }])
    .filter('firstname', function () {
        return function (input) {
            return !input ? input : input.split(' ')[0];
        };
    })
    .filter('phoneNo', function () {
        return function (input) {
            if (!input)
                return 'Hidden number';

            if (input.indexOf('00') === 0)
                input = input.substring(2);

            try {
                let localNumber = input.substring(2);
                let localNumber_formatted = '';
                let groupSize = localNumber.length % 2 === 0 ? 2 : 3;

                for (var i = 0; i < localNumber.length; i += groupSize) {
                    let numberGroup = localNumber.substring(i, i + groupSize);
                    localNumber_formatted += numberGroup + ' ';
                }
                return '+' + input.substring(0, 2) + ' ' + localNumber_formatted;
            } catch (e) {
                return input;
            }

        };
    })
    .filter('callStatus', function () {
        return function (status) {
            return status === 'orphaned' ? 'missed' : status;
        };
    })
    .filter('contact', ['$filter', function ($filter) {
        return function (contactName, phoneNo) {
            return contactName ?
                contactName : //+ ' (' + $filter('phoneNo')(phoneNo) + ')':
                'Unknown';//$filter('phoneNo')(phoneNo);
        };
    }])
    .filter('duration', function () {
        return function (input) {
            let minutes = Math.floor(input / 60);
            let minsInSeconds = minutes * 60;
            let seconds = input - minsInSeconds;

            let hours = Math.floor(minutes / 60);
            let hoursInMin = hours * 60;
            minutes = minutes - hoursInMin;

            if (hours > 0) {
                return hours + ' hour(s), ' + minutes + ' min(s)';
            } else if (minutes > 0) {
                return minutes + ' min(s), ' + seconds + ' sec(s)';
            } else {
                return seconds + ' sec(s)';
            }
        };
    });

app.controller('MainController', ['$scope', '$rootScope', function ($scope, $rootScope) {

    $scope.showingSettings = false;

    $scope.toggleSettings = function () {
        $scope.showingSettings = !$scope.showingSettings;
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

