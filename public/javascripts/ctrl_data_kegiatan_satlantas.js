var app = angular.module('polamikatApp');

app.controller('dataKegiatanSatlantasCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    $scope.sortType = 'startDate';
    $scope.sortReverse = true;

    $scope.kegiatanData = [];
    $scope.totalKegiatan = 0;
    $scope.kegiatanPerPage = 25;

    $scope.pagination = {
        current: 1
    };

    $scope.pageChanged = function(newPage) {
        $scope.getKegiatan(newPage);
    };

    $scope.getKegiatan = function(pageNumber) {
        showMessage.showLoadingIndicator($scope, "Getting activity list...");
        rest.activities.list(pageNumber, $scope.kegiatanPerPage, $scope.sortType, $scope.sortReverse, function(response) {
            showMessage.hideLoadingIndicator($scope);
            if (response.data) {
                $scope.kegiatanData = [];
                $scope.kegiatanData = angular.copy(response.data.activities);
                $scope.totalKegiatan = response.data.count;
            } else {
                $scope.kegiatanData = [];
                $scope.totalKegiatan = 0;
            }
        }, function(response) {
            showMessage.hideLoadingIndicator($scope);
            showMessage.error("Failed", "Retrieving personil activities failed due to some server error! Please try again.", 
                    null, 
                    function(ok) {});
        });
    }

    $scope.kegiatanDetail = function(activity) {
        // save to rootScope current pagination
        $rootScope.activityPagination = $scope.pagination;
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

    $scope.refreshBySort = function(col_name) {
        $scope.sortType = col_name;
        $scope.sortReverse = !$scope.sortReverse;
        $scope.pagination.current = 1;
        $scope.getKegiatan($scope.pagination.current);
    }

    if ($rootScope.activityPagination) {
        $scope.pagination = angular.copy($rootScope.activityPagination);
        delete $rootScope.activityPagination;
    }
    $scope.getKegiatan($scope.pagination.current);
});