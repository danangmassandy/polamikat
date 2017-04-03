var app = angular.module('polamikatApp');

app.constant('globalConstant', {
    // Attendance Values
    ATTENDANCE_VALUES : {
        PRESENT         : 0,
        ON_LEAVE        : 1,
        MEDICAL_LEAVE   : 2,
        WITHOUT_NOTICE  : 3
    }
});