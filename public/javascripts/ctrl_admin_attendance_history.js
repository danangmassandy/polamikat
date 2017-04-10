var app = angular.module('polamikatApp');

app.controller('adminAttendanceHistoryCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    if(!$rootScope.me.isAdmin){
        showMessage.accessDenied(null,
                                 function(ok) {});
        $scope.goTo('/');
        return;
    }

    $scope.tblSortReverse = "";
    $scope.tblSortType = "";

    $scope.period = "monthly";
    $scope.currDate = moment();
    $scope.currDateStr = $scope.currDate.format("DD-MM-YYYY");
    $scope.attendanceListData = [];

    $scope.loadAttendanceByPeriod = function() {
        rest.admin.attendanceByPeriod($scope.period, $scope.currDate, function(response) {
            console.log("attendanceList response ", response);
            if (response.data.data)
                $scope.attendanceListData = angular.copy(response.data.data);
            else
                $scope.attendanceListData = [];
        });
    }

    // init
    $scope.loadAttendanceByPeriod();

    $scope.reset = function() {
        showMessage.confirm("Konfirm Reset Daftar Hadir", "Anda yakin untuk reset daftar hadir personil?", "Ok", "Cancel", function(){
            rest.admin.resetAttendance(function(response) {
                console.log("reset daftar hadir response ", response);
                showMessage.error("Success", "Sukses reset daftar hadir!", "Ok", function(){
                    $rootScope.back();
                });
            }, function(response) {            
                // error
                showMessage.error("Error", "Error pada reset daftar hadir. Silahkan kontak system administrator.", "Ok", function(){});
                $rootScope.back();
            });
        }, function(){});
    }

    $scope.changePeriod = function(p_period) {
        $scope.period = p_period;
        $scope.loadAttendanceByPeriod();
    }

    $scope.onCurrDateChanged = function(newValue, oldValue) {
        $scope.loadAttendanceByPeriod();
    }

});