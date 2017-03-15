var app = angular.module('polamikatApp');

app.controller('adminKategoriKegiatanCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    if(!$rootScope.me.isAdmin){
        showMessage.accessDenied(null,
                                 function(ok) {});
        $scope.goTo('/');
        return;
    }

    $scope.kategoriKegiatanData = [];

    $scope.loadCategoryList = function() {
        rest.activities.categoryList(function(response){
            console.log("category ", response);
            if (response.data.data)
                $scope.kategoriKegiatanData = angular.copy(response.data.data);
            else
                $scope.kategoriKegiatanData = [];
        });
    }
    $scope.loadCategoryList();

    function CategoryDialogController($scope, $mdDialog, parentScope, isAdd, existingCategory) {
        $scope.updateKategori = {};
        if (!isAdd) {
            $scope.updateKategori = angular.copy(existingCategory);
        }
        $scope.saveKategori = function() {
            if (isAdd) {
                rest.admin.addKategoriKegiatan($scope.updateKategori, function(response) {
                    $mdDialog.cancel();    
                }, function(response) {
                    showMessage.success("Error", "Error Tambah Kategori. Coba Lagi!", "Ok", function() {
                    });
                });
            } else {
                rest.admin.updateKategoriKegiatan($scope.updateKategori, function(response) {
                    $mdDialog.cancel();    
                }, function(response) {
                    showMessage.success("Error", "Error Update Kategori. Coba Lagi!", "Ok", function() {
                    });
                });
            }
        }
        $scope.back = function() {
            $mdDialog.cancel();
        }
    }

    $scope.tambahKategori = function($event) {
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            templateUrl: '/tpl/dialog_kategori',
            locals: {
                parentScope : $scope,
                isAdd : true,
                existingCategory : null
            },
            controller: CategoryDialogController
        }).finally(function() {
            $scope.loadCategoryList();
        });
    }

    $scope.updateKategori = function($event, category) {
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            templateUrl: '/tpl/dialog_kategori',
            locals: {
                parentScope : $scope,
                isAdd : false,
                existingCategory : category
            },
            controller: CategoryDialogController
        }).finally(function() {
            $scope.loadCategoryList();
        });
    }

});