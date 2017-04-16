var app = angular.module('polamikatApp');

app.controller('adminDataManagementCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    if(!$rootScope.me.isAdmin){
        showMessage.accessDenied(null,
                                 function(ok) {});
        $scope.goTo('/');
        return;
    }

    $scope.tblSortReverse = "";
    $scope.tblSortType = "";
    $scope.listFiles = [];

    $scope.loadDBBackupfiles = function() {
        showMessage.showLoadingIndicator($scope, "Getting backup list...");
        rest.admin.dbBackupList(function(response) {
            showMessage.hideLoadingIndicator($scope);
            if (response.data.data)
                $scope.listFiles = angular.copy(response.data.data);
            else
                $scope.listFiles = [];
        }, function(response) {
            showMessage.hideLoadingIndicator($scope);
            showMessage.error("Error", "Error load backup list. Silahkan kontak system administrator.", "Ok", function(){});
        });
    }

    $scope.humanFileSize = function(bytes) {
        var si = true;
        var thresh = si ? 1000 : 1024;
        if(Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        var units = si
            ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
            : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while(Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1)+' '+units[u];
    }

    $scope.downloadFile = function(file) {
        rest.admin.dbBackupDownload(file.filename, function(msgSuccess) {

        }, function(msgError) {

        });
    }

    // init
    $scope.loadDBBackupfiles();

});