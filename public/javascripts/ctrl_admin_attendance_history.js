var app = angular.module('polamikatApp');

function convertArrayOfObjectsToCSV(args) {  
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}

function downloadCSV(args, csv) {  
    var data, filename, link;
    // var csv = convertArrayOfObjectsToCSV({
    //     data: data
    // });
    if (csv == null) return;

    filename = args.filename || 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
}

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
        showMessage.showLoadingIndicator($scope, "Loading attendance history...");
        rest.attendance.attendanceByPeriod($scope.period, $scope.currDate, function(response) {
            showMessage.hideLoadingIndicator($scope);
            console.log("attendanceList response ", response);
            if (response.data.data)
                $scope.attendanceListData = angular.copy(response.data.data);
            else
                $scope.attendanceListData = [];
        }, function(response) {            
            // error
            showMessage.hideLoadingIndicator($scope);
            showMessage.error("Error", "Error pada load daftar hadir. Silahkan kontak system administrator.", "Ok", function(){});
            $scope.attendanceListData = [];
        });
    }

    // init
    $scope.loadAttendanceByPeriod();

    $scope.reset = function() {
        showMessage.confirm("Konfirm Reset Daftar Hadir", "Anda yakin untuk reset daftar hadir personil?", "Ok", "Cancel", function(){
            showMessage.showLoadingIndicator($scope, "Deleting attendance history...");
            rest.attendance.resetAttendance(function(response) {
                showMessage.hideLoadingIndicator($scope);
                console.log("reset daftar hadir response ", response);
                showMessage.success("Success", "Sukses reset daftar hadir!", "Ok", function(){
                    $scope.loadAttendanceByPeriod();
                });
            }, function(response) {            
                // error
                showMessage.hideLoadingIndicator($scope);
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

    $scope.downloadDataAsCSV = function() {
        var data = [];
        for (var i = 0; i < $scope.attendanceListData.length; ++i) {
            var name = $scope.attendanceListData[i].name;
            if (name.indexOf(",") >= 0)
                name = '"' + name + '"';
            data.push({
                No : i + 1,
                NRP : $scope.attendanceListData[i].nrp,
                Pangkat : $scope.attendanceListData[i].pangkat,
                Nama : name,
                Hadir : $scope.attendanceListData[i].totalPresent,
                Ijin : $scope.attendanceListData[i].totalOnLeave,
                Sakit : $scope.attendanceListData[i].totalMedicalLeave,
                'Tanpa Keterangan' : $scope.attendanceListData[i].totalWithoutNotice,
                Total : $scope.attendanceListData[i].total
            });
        }
        var csv = convertArrayOfObjectsToCSV({
            data: data
        });

        // generate filename
        var filename = "absen-";
        if ($scope.period == "daily") {
            filename += "harian-" + $scope.currDate.format("DDMMYYYY") + ".csv";
        } else if ($scope.period == "monthly") {
            filename += "bulanan-" + $scope.currDate.format("DDMMYYYY") + ".csv";
        } else if ($scope.period == "weekly") {
            filename += "mingguan-" + $scope.currDate.format("DDMMYYYY") + ".csv";
        } else {
            filename += ".csv";
        }

        downloadCSV({
            filename : filename
        }, csv);
    }

});