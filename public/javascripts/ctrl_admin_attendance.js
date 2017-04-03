var app = angular.module('polamikatApp');

var attendanceRankCustomTooltips = function(tooltip) {
    // Tooltip Element
    var tooltipEl = document.getElementById('chartjs-tooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        tooltipEl.innerHTML = ""
        document.body.appendChild(tooltipEl);
    }
    // Hide if no tooltip
    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
    }
    // Set caret Position
    tooltipEl.classList.remove('above', 'below', 'no-transform');
    if (tooltip.yAlign) {
        tooltipEl.classList.add(tooltip.yAlign);
    } else {
        tooltipEl.classList.add('no-transform');
    }
    function getBody(bodyItem) {
        return bodyItem.lines;
    }
    // Set Text
    if (tooltip.body) {
        var sum = tooltip.dataPoints[0].yLabel;
        var titleLines = tooltip.title || [];
        var bodyLines = tooltip.body.map(getBody);
        var innerHtml = '<div class="arrowRight tooltipBody layout-column flex">';
        innerHtml += '<div class="tooltipTitle">';
        titleLines.forEach(function(title) {
            innerHtml += '<span>' + title + '</span>';
        });
        innerHtml += '</div>';
        innerHtml += '<div class="layout-row"><span class="tooltipTotalLabel">Total</span>&nbsp;&nbsp;&nbsp;<span class="tooltipNumber">'+sum+'</span></div>';
        innerHtml += '</div>';
        tooltipEl.innerHTML = innerHtml;
    }
    var position = this._chart.canvas.getBoundingClientRect();
    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.classList.remove('tooltipDivRight');
    tooltipEl.classList.remove('tooltipDivLeft');
    if (position.left + tooltip.caretX + 300 + 12 >= position.right) {
        if (position.left + tooltip.caretX - 330 > 0) {
            tooltipEl.classList.add('tooltipDivRight');
            tooltipEl.style.left = position.left + tooltip.caretX - 330 + 'px';
        } else {
            tooltipEl.classList.add('tooltipDivLeft');
            tooltipEl.style.left = position.left + tooltip.caretX + 'px';
        }
    } else {
        tooltipEl.classList.add('tooltipDivLeft');
        tooltipEl.style.left = position.left + tooltip.caretX + 'px';
    }
    
    // fix position.top because getBoundingClientRect gets values with respect to the window
    tooltipEl.style.top = position.top + window.scrollY + tooltip.caretY + 'px';
    tooltipEl.style.width = "300px";
    tooltipEl.style.fontFamily = tooltip._fontFamily;
    tooltipEl.style.fontSize = tooltip.fontSize;
    tooltipEl.style.fontStyle = tooltip._fontStyle;
    tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
};

var getLabelAttendanceRankChart = function(data) {
    return data.personilName;
}

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
        rest.admin.attendanceList($scope.currentDate, function(response){
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
        });
    }
    $scope.loadAttendanceList();

    $scope.attendanceDate = moment().format("DD-MM-YYYY");
    $scope.lastUpdated = null;

    $scope.saveAttendanceList = function() {
        console.log("saveAttendanceList ");
        rest.admin.updateAttendance($scope.currentDate, $scope.attendanceListData, function(response) {
            console.log("saveAttendanceList response ", response);
            showMessage.error("Success", "Sukses update daftar hadir personil!", "Ok", function(){
                $rootScope.back();
            });
        }, function(response) {
            // error
            showMessage.error("Error", "Error pada update daftar hadir personil. Silahkan kontak system administrator.", "Ok", function(){});
            $rootScope.back();
        });
    }

    // graphs
    $scope.attendanceRankByOnLeaveChart = {
        labels : [],
        data : [],
        colors : [],
        series : ["Personil Ijin"],
        options : {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        userCallback: function(label, index, labels) {
                            // when the floored value is the same as the value we have a whole number
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        },
                    },
                    gridLines : {
                        display : true,
                        borderDash : [2, 5],
                        drawBorder : false
                    }
                }],
                xAxes: [{
                    type : 'myScale',
                    categoryPercentage : 0.4,
                    gridLines : {
                        display : false,
                        drawBorder : true,
                        zeroLineWidth : 0,
                        zeroLineColor : 'rgba(0,0,0,0)',
                        offsetGridLines : true
                    }
                }]
            },
            tooltips: {
                enabled: false,
                mode: 'index',
                position: 'average',
                custom: attendanceRankCustomTooltips
            },
            responsive : true,
            maintainAspectRatio : false
        },
        datasetsOverrides : {},
        canvasWidth : 1000,
        personil : "",
        loaded : false
    }

    $scope.resetAttendanceRankByOnLeaveChart = function() {
        $scope.attendanceRankByOnLeaveChart.labels = [];
        $scope.attendanceRankByOnLeaveChart.data = [];
        $scope.attendanceRankByOnLeaveChart.datasetsOverrides = {};
    }

    $scope.initAttendanceRankByOnLeaveChart = function(data) {
        var labels = [];
        var data1 = [];
        var backgroundColor = [];
        for (var i = 0; i < data.length; ++i) {
            var label = getLabelAttendanceRankChart(data[i]);
            labels.push(label);
            data1.push(data[i].total);
            backgroundColor.push('rgb(59, 191, 189)');
        }
        $scope.attendanceRankByOnLeaveChart.labels = labels;
        $scope.attendanceRankByOnLeaveChart.data = data1;
        $scope.attendanceRankByOnLeaveChart.datasetsOverrides = {
            borderWidth: 1,
            hoverBorderWidth: 1.3,
            borderColor: backgroundColor,
            hoverBorderColor: backgroundColor,
            backgroundColor: backgroundColor,
            hoverBackgroundColor: backgroundColor
        };
        $scope.attendanceRankByOnLeaveChart.canvasWidth = 125 * data.length;
        $scope.attendanceRankByOnLeaveChart.loaded = true;
    }
    $scope.recallAttendanceRankByOnLeaveChart = function() {
        $scope.attendanceRankByOnLeaveChart.loaded = false;
        $scope.resetAttendanceRankByOnLeaveChart();
        rest.admin.attendanceByValue(globalConstant.ATTENDANCE_VALUES.ON_LEAVE, function(response) {
            console.log("recallAttendanceRankByOnLeaveChart ", response);
            $scope.initAttendanceRankByOnLeaveChart(response.data.data);
        });
    }
    // init
    $scope.recallAttendanceRankByOnLeaveChart();

    $scope.attendanceRankByMedicalLeaveChart = {
        labels : [],
        data : [],
        colors : [],
        series : ["Personil Ijin Sakit"],
        options : {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        userCallback: function(label, index, labels) {
                            // when the floored value is the same as the value we have a whole number
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        },
                    },
                    gridLines : {
                        display : true,
                        borderDash : [2, 5],
                        drawBorder : false
                    }
                }],
                xAxes: [{
                    type : 'myScale',
                    categoryPercentage : 0.4,
                    gridLines : {
                        display : false,
                        drawBorder : true,
                        zeroLineWidth : 0,
                        zeroLineColor : 'rgba(0,0,0,0)',
                        offsetGridLines : true
                    }
                }]
            },
            tooltips: {
                enabled: false,
                mode: 'index',
                position: 'average',
                custom: attendanceRankCustomTooltips
            },
            responsive : true,
            maintainAspectRatio : false
        },
        datasetsOverrides : {},
        canvasWidth : 1000,
        personil : "",
        loaded : false
    }

    $scope.resetAttendanceRankByMedicalLeaveChart = function() {
        $scope.attendanceRankByMedicalLeaveChart.labels = [];
        $scope.attendanceRankByMedicalLeaveChart.data = [];
        $scope.attendanceRankByMedicalLeaveChart.datasetsOverrides = {};
    }

    $scope.initAttendanceRankByMedicalLeaveChart = function(data) {
        var labels = [];
        var data1 = [];
        var backgroundColor = [];
        for (var i = 0; i < data.length; ++i) {
            var label = getLabelAttendanceRankChart(data[i]);
            labels.push(label);
            data1.push(data[i].total);
            backgroundColor.push('rgb(59, 191, 189)');
        }
        $scope.attendanceRankByMedicalLeaveChart.labels = labels;
        $scope.attendanceRankByMedicalLeaveChart.data = data1;
        $scope.attendanceRankByMedicalLeaveChart.datasetsOverrides = {
            borderWidth: 1,
            hoverBorderWidth: 1.3,
            borderColor: backgroundColor,
            hoverBorderColor: backgroundColor,
            backgroundColor: backgroundColor,
            hoverBackgroundColor: backgroundColor
        };
        $scope.attendanceRankByMedicalLeaveChart.canvasWidth = 125 * data.length;
        $scope.attendanceRankByMedicalLeaveChart.loaded = true;
    }
    $scope.recallAttendanceRankByMedicalLeaveChart = function() {
        $scope.attendanceRankByMedicalLeaveChart.loaded = false;
        $scope.resetAttendanceRankByMedicalLeaveChart();
        rest.admin.attendanceByValue(globalConstant.ATTENDANCE_VALUES.MEDICAL_LEAVE, function(response) {
            console.log("recallAttendanceRankByMedicalLeaveChart ", response);
            $scope.initAttendanceRankByMedicalLeaveChart(response.data.data);
        });
    }
    // init
    $scope.recallAttendanceRankByMedicalLeaveChart();

    $scope.attendanceRankByNoNoticeChart = {
        labels : [],
        data : [],
        colors : [],
        series : ["Personil Ijin Sakit"],
        options : {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        userCallback: function(label, index, labels) {
                            // when the floored value is the same as the value we have a whole number
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        },
                    },
                    gridLines : {
                        display : true,
                        borderDash : [2, 5],
                        drawBorder : false
                    }
                }],
                xAxes: [{
                    type : 'myScale',
                    categoryPercentage : 0.4,
                    gridLines : {
                        display : false,
                        drawBorder : true,
                        zeroLineWidth : 0,
                        zeroLineColor : 'rgba(0,0,0,0)',
                        offsetGridLines : true
                    }
                }]
            },
            tooltips: {
                enabled: false,
                mode: 'index',
                position: 'average',
                custom: attendanceRankCustomTooltips
            },
            responsive : true,
            maintainAspectRatio : false
        },
        datasetsOverrides : {},
        canvasWidth : 1000,
        personil : "",
        loaded : false
    }

    $scope.resetAttendanceRankByNoNoticeChart = function() {
        $scope.attendanceRankByNoNoticeChart.labels = [];
        $scope.attendanceRankByNoNoticeChart.data = [];
        $scope.attendanceRankByNoNoticeChart.datasetsOverrides = {};
    }

    $scope.initAttendanceRankByNoNoticeChart = function(data) {
        var labels = [];
        var data1 = [];
        var backgroundColor = [];
        for (var i = 0; i < data.length; ++i) {
            var label = getLabelAttendanceRankChart(data[i]);
            labels.push(label);
            data1.push(data[i].total);
            backgroundColor.push('rgb(59, 191, 189)');
        }
        $scope.attendanceRankByNoNoticeChart.labels = labels;
        $scope.attendanceRankByNoNoticeChart.data = data1;
        $scope.attendanceRankByNoNoticeChart.datasetsOverrides = {
            borderWidth: 1,
            hoverBorderWidth: 1.3,
            borderColor: backgroundColor,
            hoverBorderColor: backgroundColor,
            backgroundColor: backgroundColor,
            hoverBackgroundColor: backgroundColor
        };
        $scope.attendanceRankByNoNoticeChart.canvasWidth = 125 * data.length;
        $scope.attendanceRankByNoNoticeChart.loaded = true;
    }
    $scope.recallAttendanceRankByNoNoticeChart = function() {
        $scope.attendanceRankByNoNoticeChart.loaded = false;
        $scope.resetAttendanceRankByNoNoticeChart();
        rest.admin.attendanceByValue(globalConstant.ATTENDANCE_VALUES.WITHOUT_NOTICE, function(response) {
            console.log("recallAttendanceRankByNoNoticeChart ", response);
            $scope.initAttendanceRankByNoNoticeChart(response.data.data);
        });
    }
    // init
    $scope.recallAttendanceRankByNoNoticeChart();
});