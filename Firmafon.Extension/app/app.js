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