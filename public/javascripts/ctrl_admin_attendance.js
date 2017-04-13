var app = angular.module('polamikatApp');

app.controller('adminAttendanceCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {

    if(!$rootScope.me.isAdmin){
        showMessage.accessDenied(null,
                                 function(ok) {});
        $scope.goTo('/');
        return;
    }

    $scope.currentDate = new Date();
    $scope.attendanceListData = [];
    $scope.isHadirAllChecked = false;
    $scope.isIjinAllChecked = false;
    $scope.isSakitAllChecked = false;
    $scope.isTanpaKeteranganAllChecked = false;

    $scope.tblSortType = '';
    $scope.tblSortReverse = false;

    $scope.checkAll = function(n) {
        $scope.isHadirAllChecked = n == globalConstant.ATTENDANCE_VALUES.PRESENT;
        $scope.isIjinAllChecked = n == globalConstant.ATTENDANCE_VALUES.ON_LEAVE;
        $scope.isSakitAllChecked = n == globalConstant.ATTENDANCE_VALUES.MEDICAL_LEAVE;
        $scope.isTanpaKeteranganAllChecked = n == globalConstant.ATTENDANCE_VALUES.WITHOUT_NOTICE;
        for (var i = 0; i < $scope.attendanceListData.length; ++i) {
            $scope.attendanceListData[i].isHadirChecked = false;
            $scope.attendanceListData[i].isIjinChecked = false;
            $scope.attendanceListData[i].isSakitChecked = false;
            $scope.attendanceListData[i].isTanpaKeteranganChecked = false;
            
            $scope.attendanceListData[i].value = n;
            $scope.attendanceListData[i].isHadirChecked = $scope.attendanceListData[i].value == globalConstant.ATTENDANCE_VALUES.PRESENT;
            $scope.attendanceListData[i].isIjinChecked = $scope.attendanceListData[i].value == globalConstant.ATTENDANCE_VALUES.ON_LEAVE;
            $scope.attendanceListData[i].isSakitChecked = $scope.attendanceListData[i].value == globalConstant.ATTENDANCE_VALUES.MEDICAL_LEAVE;
            $scope.attendanceListData[i].isTanpaKeteranganChecked = $scope.attendanceListData[i].value == globalConstant.ATTENDANCE_VALUES.WITHOUT_NOTICE;
        }
    }

    $scope.checkSingle = function(item, n) {
        $scope.isHadirAllChecked = false;
        $scope.isIjinAllChecked = false;
        $scope.isSakitAllChecked = false;
        $scope.isTanpaKeteranganAllChecked = false;

        item.isHadirChecked = false;
        item.isIjinChecked = false;
        item.isSakitChecked = false;
        item.isTanpaKeteranganChecked = false;

        item.value = n;
        item.isHadirChecked = item.value == globalConstant.ATTENDANCE_VALUES.PRESENT;
        item.isIjinChecked = item.value == globalConstant.ATTENDANCE_VALUES.ON_LEAVE;
        item.isSakitChecked = item.value == globalConstant.ATTENDANCE_VALUES.MEDICAL_LEAVE;
        item.isTanpaKeteranganChecked = item.value == globalConstant.ATTENDANCE_VALUES.WITHOUT_NOTICE;
    }
    
    $scope.loadAttendanceList = function() {
        showMessage.showLoadingIndicator($scope, "Loading attendance list...");
        rest.attendance.attendanceList($scope.currentDate, function(response){
            showMessage.hideLoadingIndicator($scope);
            console.log("attendanceList response ", response);
            if (response.data.data)
                $scope.attendanceListData = angular.copy(response.data.data);
            else
                $scope.attendanceListData = [];
            if ($scope.attendanceListData && $scope.attendanceListData.length) {
                var updatedAt = $scope.attendanceListData[0].updatedAt || $scope.attendanceListData[0].createdAt;
                $scope.lastUpdated = updatedAt;
                for (var i = 0; i < $scope.attendanceListData.length; ++i) {
                    $scope.attendanceListData[i].isHadirChecked = $scope.attendanceListData[i].value == globalConstant.ATTENDANCE_VALUES.PRESENT;
                    $scope.attendanceListData[i].isIjinChecked = $scope.attendanceListData[i].value == globalConstant.ATTENDANCE_VALUES.ON_LEAVE;
                    $scope.attendanceListData[i].isSakitChecked = $scope.attendanceListData[i].value == globalConstant.ATTENDANCE_VALUES.MEDICAL_LEAVE;
                    $scope.attendanceListData[i].isTanpaKeteranganChecked = $scope.attendanceListData[i].value == globalConstant.ATTENDANCE_VALUES.WITHOUT_NOTICE;
                }
            }
        }, function(response) {            
            // error
            showMessage.hideLoadingIndicator($scope);
            showMessage.error("Error", "Error pada load daftar hadir. Silahkan kontak system administrator.", "Ok", function(){});
            $scope.attendanceListData = [];
        });
    }
    $scope.loadAttendanceList();

    $scope.attendanceDate = moment().format("DD-MM-YYYY");
    $scope.lastUpdated = null;

    $scope.saveAttendanceList = function() {
        console.log("saveAttendanceList ");
        showMessage.showLoadingIndicator($scope, "Saving attendance list...");
        rest.attendance.updateAttendance($scope.currentDate, $scope.attendanceListData, function(response) {
            showMessage.hideLoadingIndicator($scope);
            console.log("saveAttendanceList response ", response);
            showMessage.success("Success", "Sukses update daftar hadir personil!", "Ok", function(){
                
            });
        }, function(response) {
            showMessage.hideLoadingIndicator($scope);
            // error
            showMessage.error("Error", "Error pada update daftar hadir personil. Silahkan kontak system administrator.", "Ok", function(){});
            $rootScope.back();
        });
    }
});