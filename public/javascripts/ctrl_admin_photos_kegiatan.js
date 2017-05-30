var app = angular.module('polamikatApp');

app.controller('adminPhotosKegiatanCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    if(!$rootScope.me.isAdmin){
        showMessage.accessDenied(null,
                                 function(ok) {});
        $scope.goTo('/');
        return;
    }

    $scope.photos = [];

    $scope.getPhotos = function() {
        showMessage.showLoadingIndicator($scope, "Loading activity photos...");
        rest.activities.photos(function(response){
            showMessage.hideLoadingIndicator($scope);
            console.log("photos ", response);
            if (response.data) {
                $scope.photos = angular.copy(response.data);
                for (var i = 0; i < $scope.photos.length;++i) {
                    $rootScope.fetchImageSync($scope.photos[i], true);
                }
            } else {
                $scope.photos = [];
            }
        }, function(response) {            
            // error
            showMessage.hideLoadingIndicator($scope);
            showMessage.error("Error", "Error pada load foto. Silahkan kontak system administrator.", "Ok", function(){});
            $scope.photos = [];
        });
    }

    $scope.showImage = function($event, photo) {
        var parentEl = angular.element(document.body);
        $rootScope.fetchImage(photo, false, function(error, photo) {
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


    // Init
    $scope.getPhotos();
});