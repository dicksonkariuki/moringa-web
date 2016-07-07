angular.module('routerApp').controller('InicioCtrl', function ($scope, $timeout, $q, InicioSrvc, InicioUI, DateUtil) {

    $scope.watersources = [];
    $scope.cities = {
        selected: null,
        options: null
    };

    $scope.cards = {
        liters: null,
        cubicMeters: null,
        water: null,
        person: null

    };

    $scope.loadCity = loadCity;

    var map, userLocation;
    var history = {
        interval: 90,
        dateRange: [],
        lines: []
    };

    $scope.$on('accordionRepeatStarted', function() {
        InicioUI.destroyAccordion();
    });

    $scope.$on('accordionRepeatFinished', function() {
        InicioUI.loadAccordion();
    });

    initialize();

    function initialize() {
        InicioSrvc.queryAllCities().then(function (cities) {
            $scope.cities.options = cities;
        });

        geolocation()
            .then(loadMap)
            .then(loadCityFromMap)
            .then(loadCityWatersources)
            .then(loadHistoryData)
            .then(loadCards);
    }

    function loadCards() {

        $scope.cards.liters = null;
        $scope.cards.cubicMeters = null;
        $scope.cards.water = null;
        $scope.cards.person = null;

        $q.all([
            InicioSrvc.queryLitersByID($scope.cities.selected.id),
            InicioSrvc.queryCubicMetersByID($scope.cities.selected.id),
            InicioSrvc.queryWaterByID($scope.cities.selected.id),
            InicioSrvc.queryPersonsByID($scope.cities.selected.id)
        ])
            .then(function (data) {
                    $scope.cards.liters = data[0].liters;
                    $scope.cards.cubicMeters = data[1];
                    $scope.cards.water = data[2];
                    $scope.cards.person = data[3];
            })
            .catch(function (error) {
                console.log(error);
                throw error;
            });
    }

    function loadCity() {
        InicioSrvc.geocodeLatLng($scope.cities.selected.name, userLocation)
            .then(loadMap)
            .then(loadCityFromMap)
            .then(loadCityWatersources)
            .then(loadHistoryData)
            .then(loadCards);
    }

    function geolocation() {
        // Using AngularJS's 'defer' to return a promise
        var defer = $q.defer();

        // we assert that the client browser can query for geolocation
        if (navigator.geolocation) {
            // and query for the current position
            navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
        }
        // if it can't, we query for the IP's geolocation
        else {
            //TODO: No native support; Query IP geolocation
        }

        // I promise I will return something to you =)
        return defer.promise;

        function geolocationSuccess(position) {
            // Geolocation avaliable. We build a nice google.maps.LatLng object to return
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            userLocation = new google.maps.LatLng(lat, lng);

            // then we resolve the promise so that it returns the client's location
            defer.resolve(userLocation);
        }

        function geolocationError(error) {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    console.log("User denied the request for Geolocation.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    console.log("Location information is unavailable.");
                    break;
                case error.TIMEOUT:
                    console.log("The request to get user location timed out.");
                    break;
                default:
                    console.log("An unknown error occurred.");
                    break;
            }
            defer.reject(error);
        }
    }

    function loadMap(latlng) {
        var options = {
            zoom: 13,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("mapa"), options);

        // Using $q.when to return a promise from a synchronous function so that it can be chained with other promises
        return $q.when(map);
    }

    function loadCityFromMap(map) {

        var geocodeCityName = InicioSrvc.geocodeCityName(map.center);
        
        var queryCityByName = geocodeCityName.then(function (cityName) {
            return InicioSrvc.queryCityByName(cityName);
        });
        
        return $q.all([geocodeCityName, queryCityByName])
            .then(function (data) {

                var city = data[1]; //City object

                $scope.cities.selected = $scope.cities.options.filter(filterCity)[0];
                return city;

                function filterCity(cityOption) {
                    return cityOption.id === city.id;
                }
            })
            .catch(function (error) {
                console.log(error);
                throw error;
            });
    }

    function loadCityWatersources(city) {
        $scope.watersources = [];

        return InicioSrvc.queryWatersources(city.id)
            .then (function (watersources) {
                $scope.watersources = watersources;
                return $scope.watersources;
            })
            .catch(function (error) {
                console.log(error);
                throw error;
            });
    }

    function loadHistoryData(watersources) {

        var endDate = new Date();
        var startDate = DateUtil.offsetDays(endDate, 1-history.interval);
        var dateFormat = "dd/MM/yyyy";
        var data = {};

        watersourcesConsumed = 0;

        history.dateRange = [];
        history.lines = [];

        return $q.all(watersources.map(function (watersource) {
            return consumeMeasurements(watersource);
        }))
            .then(doneConsuming)
            .catch(function (error) {
                console.log(error);
                throw error;
            });

        function consumeMeasurements(watersource) {

            var label = watersource.name;

            var percent = ((watersource.waterSourceMeasurements[0].value / watersource.capacity) * 100);
            watersource['percent'] = percent;
            watersource['class'] = percent <= 5 ? 'worst' : percent > 5 && percent <= 20 ? 'bad' : percent > 20 && percent < 100 ? 'regular' : percent >= 100 ? 'best' : '';

            return InicioSrvc.queryMeasurements(watersource.id, DateUtil.format(dateFormat, startDate), DateUtil.format(dateFormat, endDate))
                .then(function (measurements) {
                    var values = {};
                    for (i=0; i<measurements.length; i++) {
                        var measurement = measurements[i];
                        values[measurement.date] = measurement.value;
                    }
                    data[label] = values;
                    return measurements;
                })
                .catch(function (error) {
                    console.log(error);
                    throw error;
                });
        }

        function doneConsuming() {
            // Assemble the date range with dates from all watersources
            Object.keys(data).map(function (label) {
                Object.keys(data[label]).map(function (date) {
                    if (history.dateRange.indexOf(+date) < 0) {
                        history.dateRange.push(+date);
                    }
                })
            });
            // sort the date range array
            history.dateRange.sort(
                function(a,b) {
                    return a>b ? 1 : a<b ? -1 : 0;
                }
            );
            // Put each watersource measurement to its destined date on the array
            Object.keys(data).map(function (label) {
                var line = [];
                var values = data[label];
                Object.keys(values).map(function (date) {
                    line[history.dateRange.indexOf(+date)] = values[+date];
                });

                // Push the data label to the first column
                line.splice(0,0,label);

                // Get the last index, regardless of array's length
                var lastIndex = line.lastIndexOf(line.slice(-1)[0]);
                // Replacing 'undefined' with null
                for (j=0; j<=lastIndex; j++) {
                    if (line[j] === undefined) {
                        line[j] = null;
                    }
                }

                history.lines.push(line);
            });

            // load the history chart
            InicioUI.loadChart(history.dateRange, history.lines);
            return history;
        }
    }
});