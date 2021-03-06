var app = angular.module('polamikatApp');

app.controller('kegiatanDetailCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, $routeParams, showMessage, globalConstant, rest) {
    var activityID = $routeParams.activityID;
    if (!activityID || !activityID.length) {
        $rootScope.back();
        return;
    }
    
    $scope.activity = {};
    $scope.personilList = [];
    $scope.categoryList = [];

    $scope.getPersonilList = function() {
        rest.users.personilList(function(response) {
            if (response.data)
                $scope.personilList = angular.copy(response.data);
            else
                $scope.personilList = [];
        });
    }

    $scope.getCategoryList = function() {
        rest.activities.categoryList(function(response) {
            if (response.data)
                $scope.categoryList = angular.copy(response.data);
            else
                $scope.categoryList = [];
        });
    }

    $scope.showImage = function($event, photo) {
        var parentEl = angular.element(document.body);
        showMessage.showLoadingIndicator($scope, "Loading photo...");
        $rootScope.fetchImage(photo, false, function(error, photo) {
            showMessage.hideLoadingIndicator($scope);
            if (error) {
                showMessage.error("Error", "Error pada load foto. Silahkan kontak system administrator.", "Ok", function(){});
            } else {
                $mdDialog.show({
                    parent: parentEl,
                    targetEvent: $event,
                    templateUrl: '/tpl/dialog_photo',
                    locals: {
                        photo : photo,
                    },
                    controller: DialogController
                });
                function DialogController($scope, $mdDialog, photo) {
                    $scope.photo = photo;

                    $scope.close = function() {
                        $mdDialog.cancel();
                    }
                }
            }
            
        });
    }


    $scope.getActivityDetail = function() {
        $scope.getPersonilList();
        $scope.getCategoryList();
        rest.activities.detail(activityID, function(response) {
            if (!response.data) {
                showMessage.error("Error", "Error detail kegiatan personil. Silahkan kontak system administrator.", "Ok", function(){});
                $rootScope.back();
                return;    
            }
            $scope.activity = angular.copy(response.data);
            $scope.activity.startDate = moment($scope.activity.startDate).toDate();
            $scope.isOwner = $rootScope.me.isAdmin || ($rootScope.me.polamikatUser.personil == $scope.activity.personil._id);
            if ($scope.activity.photos) {
                for (var i = 0; i < $scope.activity.photos.length;++i) {
                    $rootScope.fetchImageSync($scope.activity.photos[i], true);
                }
            }
            
        }, function(response) {
            // error
            showMessage.error("Error", "Error detail personil. Silahkan kontak system administrator.", "Ok", function(){});
            $rootScope.back();
        });
    }
    $scope.getActivityDetail();
});