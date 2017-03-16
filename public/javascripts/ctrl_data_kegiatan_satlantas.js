var app = angular.module('polamikatApp');

app.controller('dataKegiatanSatlantasCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    $scope.kegiatanData = [];

    rest.activities.list(function(response) {
        if (response.data) {
            $scope.kegiatanData = angular.copy(response.data.activities);
        } else {
            $scope.kegiatanData = [];
        }
    }, function(response) {
        showMessage.error("Failed", "Retrieving personil activities failed due to some server error! Please try again.", 
                null, 
                function(ok) {});
    });

    $scope.kegiatanDetail = function(activity) {
        $scope.goTo('kegiatan_detail/'+activity._id);
    }
});