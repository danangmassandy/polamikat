var app = angular.module('polamikatHomePageApp', [ 'ngMaterial', 'ngRoute', 'ngLodash' ]);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/a', {
            templateUrl: '/tpl/home_index',
        // }).when('/update_user_profile', {
        //     templateUrl: '/tpl/clinic_user_profile',
        //     controller: 'userProfileCtrl',
        }).otherwise({
            redirectTo: '/'
        });
});


app.config(function($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
        return moment(date).format('DD/MM/YYYY');
    };

    $mdDateLocaleProvider.parseDate = function(dateString) {
        var m = moment(dateString, 'DD/MM/YYYY', true);
        return m.isValid() ? m.toDate() : new Date(NaN);
    };
});

app.controller('mainCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $location, $timeout, $filter, $route, $window) {
    $scope.doLogin = function() {
        $window.location.href = '/a';
    }
});

