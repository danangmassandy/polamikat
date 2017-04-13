var app = angular.module('polamikatApp');

app.controller('dataKegiatanSatlantasCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    $scope.kegiatanData = [];

    showMessage.showLoadingIndicator($scope, "Getting activity list...");
    rest.activities.list(function(response) {
        showMessage.hideLoadingIndicator($scope);
        if (response.data) {
            $scope.kegiatanData = angular.copy(response.data.activities);
        } else {
            $scope.kegiatanData = [];
        }
    }, function(response) {
        showMessage.hideLoadingIndicator($scope);
        showMessage.error("Failed", "Retrieving personil activities failed due to some server error! Please try again.", 
                null, 
                function(ok) {});
    });

    $scope.kegiatanDetail = function(activity) {
        if($rootScope.me.isAdmin){
            $scope.goTo('kegiatan_update/'+activity._id);
        } else {
            if ($rootScope.me.polamikatUser.personil == activity.personil._id) {
                $scope.goTo('kegiatan_update/'+activity._id);
            } else {
                $scope.goTo('kegiatan_detail/'+activity._id);
            }
        }
    }
});