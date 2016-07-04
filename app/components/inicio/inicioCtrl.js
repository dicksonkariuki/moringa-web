angular.module('routerApp').controller('InicioCtrl', function ($scope, $timeout, InicioSrvc, InicioUI, DateUtil) {

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

    }

    $scope.mapSearch = mapSearch;
    $scope.loadCity = loadCity;
    $scope.dataLoaded = false;

    var map;
    /**
     * 
     * @type {{interval: number, dateRange: Array, lines: Array}}
     */
    var history = {
        interval: 90,
        dateRange: [],
        lines: []
    };

    $scope.$on('accordionRepeatStarted', function(ngRepeatFinishedEvent) {
        InicioUI.destroyAccordion();
    });

    $scope.$on('accordionRepeatFinished', function(ngRepeatFinishedEvent) {
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
        InicioSrvc.queryLitersByID($scope.cities.selected.id)
            .then(function (data) {
                $scope.cards.liters = data.liters;
                $scope.dataLoaded = true;
            });
        InicioSrvc.queryCubicMetersByID($scope.cities.selected.id)
            .then(function (cubicMeters) {
                $scope.cards.cubicMeters = cubicMeters;
            });
        InicioSrvc.queryWaterByID($scope.cities.selected.id)
            .then(function (water) {
                $scope.cards.water = water;
            });
        InicioSrvc.queryPersonsByID($scope.cities.selected.id)
            .then(function (person) {
                $scope.cards.person = person;
            });
    }

    function loadCity() {
        InicioSrvc.geocodeLatLng($scope.cities.selected.name)
            .then(loadMap)
            .then(loadCityFromMap)
            .then(loadCityWatersources)
            .then(loadHistoryData)
            .then(loadCards);
    }

    function geolocation() {
        var deferred = $.Deferred();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
        } else {
            //TODO: No native support; Query IP geolocation
        }

        return deferred.promise();

        function geolocationSuccess(position) {
            // Geolocation avaliable. Let's show a map!
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            deferred.resolve(new google.maps.LatLng(lat, lng))
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
                case error.UNKNOWN_ERROR:
                    console.log("An unknown error occurred.");
                    break;
            }
            deferred.reject(error);
        }
    }

    function mapSearch(inputSearch) {
        InicioSrvc.geocodeLatLng(inputSearch).then(geocodeLatLngSuccess, geocodeLatLngError);
        
        function geocodeLatLngSuccess(latlng) {
            loadMap(latlng)
                .then(loadCityFromMap)
                .then(loadCityWatersources)
                .then(loadHistoryData);
        }
        
        function geocodeLatLngError(error) {
            console.log(error);
        }
    }

    function loadMap(latlng) {
        var deferred = $.Deferred();
        var options = {
            zoom: 13,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("mapa"), options);

        deferred.resolve(map);

        //TODO handle possible errors with deferred.reject(a);

        return deferred.promise();
    }

    function loadCityFromMap(map) {
        var deferred = $.Deferred();

        InicioSrvc.geocodeCityName(map.center).then(geocodeCitySuccess, geocodeCityError);

        return deferred.promise();

        function geocodeCitySuccess(cityName) {

            InicioSrvc.queryCityByName(cityName).then(queryCityByNameSuccess, queryCityByNameError);

            function queryCityByNameSuccess(city) {
                var citySelected = $scope.cities.options.filter(filterCity)[0];
                $scope.cities.selected = citySelected;
                deferred.resolve(city);

                function filterCity(cityOption) {
                    return cityOption.id === city.id;
                }
            }

            function queryCityByNameError(error) {
                console.log(error);
                deferred.reject(error);
            }
        }

        function geocodeCityError(error) {
            console.log(error);
            deferred.reject(error);
        }
    }

    function loadCityWatersources(city) {
        var deferred = $.Deferred();

        InicioSrvc.queryWatersources(city.id).then (queryWatersourcesSuccess, queryWatersourcesError);

        return deferred.promise();

        function queryWatersourcesSuccess(watersources) {
            $scope.watersources = watersources;
            deferred.resolve($scope.watersources);
        }

        function queryWatersourcesError(error) {
            console.log(error);
            deferred.reject(error);
        }
    }

    function loadHistoryData(watersources) {
        var deferred = $.Deferred();

        var endDate = new Date();
        var startDate = DateUtil.offsetDays(endDate, 1-history.interval);
        var dateFormat = "dd/MM/yyyy";
        var data = new Object();

        watersourcesConsumed = 0;

        history.dateRange = [];
        history.lines = [];

        watersources.forEach(consumeMeasurements);

        return deferred.promise();

        function consumeMeasurements(watersource) {

            var label = watersource.name;

            InicioSrvc.queryMeasurements(watersource.id, DateUtil.format(dateFormat, startDate), DateUtil.format(dateFormat, endDate))
                .then(queryMeasurementsSuccess, queryMeasurementsError)
                .then(doneConsuming);

            function queryMeasurementsSuccess(measurements) {

                var values = {};

                for (i=0; i<measurements.length; i++) {
                    var measurement = measurements[i];
                    values[measurement.date] = measurement.value;
                }

                data[label] = values;
                watersourcesConsumed++;
            }

            function queryMeasurementsError(error) {
                console.log(error);
                watersourcesConsumed++;
            }
        }

        function doneConsuming() {
            if (watersourcesConsumed === watersources.length) {
                var labels = Object.keys(data);
                // Assemble the date range with dates from all watersources
                for (i=0; i<labels.length; i++) {
                    var values = data[labels[i]];
                    var dates = Object.keys(values);
                    for (j=0; j<dates.length; j++) {
                        var date = +dates[j];
                        if (history.dateRange.indexOf(date) < 0) {
                            history.dateRange.push(date);
                            history.dateRange.sort(
                                function(a,b) {
                                    return a>b ? 1 : a<b ? -1 : 0;
                                }
                            );
                        }
                    }
                }
                // Put each watersource measurement to its destined date on the array
                for (i=0; i<labels.length; i++) {
                    var line = [];
                    var values = data[labels[i]];
                    var dates = Object.keys(values);
                    for (j=0; j<dates.length; j++) {
                        var date = +dates[j];
                        line[history.dateRange.indexOf(date)] = values[date];
                    }
                    // Push the data label to the first column
                    line.splice(0,0,labels[i]);

                    // Get the last index, regardless of array's length
                    var lastIndex = line.lastIndexOf(line.slice(-1)[0]);

                    // Replace 'undefined' with null
                    for (j=0; j<=lastIndex; j++) {
                        if (line[j] === undefined) {
                            line[j] = null;
                        }
                    }

                    history.lines.push(line);
                }
                InicioUI.loadChart(history.dateRange, history.lines);
                deferred.resolve(history);
            }
        }
    }
});