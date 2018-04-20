
app.controller('SettingsController', ['$scope', '$rootScope', function ($scope, $rootScope) {

    $scope.signOut = $rootScope.resetApp;

    helper.fetchRules(function (rules) {
        $scope.rules = rules || [];
        $scope.$apply();
    });

    function save() {
        helper.saveRules($scope.rules);
    }

    var ruleTemplate = {
        direction: "any",
        trigger: "answer",
        shouldPrompt: "true",
        enabled: "allways",
        url: "",
        name: "",
        paused: false
    };

    $scope.newRule = function () {
        let newRule = {};
        $.extend(newRule, ruleTemplate);
        $scope.rules.push(newRule);
    };

    $scope.deleteRule = function (rule) {
        var index = $scope.rules.indexOf(rule);
        $scope.rules.splice(index, 1);
        save();
    };

    $scope.exportFocus = function (elem) {

        let copyText = elem;
        copyText.select();
        var copy = window.document.execCommand("Copy");
        if (copy) {
            alert("Copied the rule to your clipboard");
        }
    }

    $scope.$watch('import', function (elem) {

        if (!elem)
            return;

        try {
            let item = JSON.parse(elem);
            if (item) {
                item = $.extend(ruleTemplate, item);
                $scope.rules.push(item);
            }
            $scope.import = '';
            setTimeout(function () { alert('Rule imported'); });
        } catch (e) {
        }
    });

}]);

app.controller('TriggerRuleController', ['$scope', '$rootScope', function ($scope, $rootScope) {

}]);

analytics.trackEvent('options', 'opened');
analytics.trackPageView();

window.onerror = function (message, source, lineno, colno, error) {
    helper.logError(message, source, lineno, colno, error);
};

