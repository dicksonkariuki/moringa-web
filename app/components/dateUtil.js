angular.module('moringaApp').factory('DateUtil', function($filter) {

    function offsetDays(date, dayCount) {
        diffTimestamp = dayCount*24*60*60*1000;
        return new Date(date.getTime() + diffTimestamp);
    }

    function getDateArray(startDate, endDate) {
        var dateArray = [];
        var currentDate = startDate;
        while (currentDate <= endDate) {
            dateArray.push( new Date (currentDate) )
            currentDate = offsetDays(currentDate, 1);
        }
        return dateArray;
    }

    function format(format, date) {
        return $filter('date')(date, format);
    }

    return {
        offsetDays:     offsetDays,
        getDateArray:   getDateArray,
        format:         format
    }

});
