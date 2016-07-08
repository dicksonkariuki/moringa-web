angular.module('routerApp').controller('InicioCtrl', function ($scope, $timeout, $q, InicioSrvc, InicioUI, DateUtil) {

    /*
     * Variables
     */

    var map, userLocation;
    var history = {
        interval: 90,
        dateRange: [],
        lines: []
    };
    $scope.watersources = null;
    $scope.cities = {
        selected: null,
        options: null
    };
    $scope.noContent = 'Sem informação.'
    $scope.cards = {
        liters: null,
        cubicMeters: null,
        water: null,
        person: null,
        clear: function () {
            var keys = Object.keys(this);
            for (i=0; i<keys.length; i++) {
                var key = keys[i];
                this[key] = key != 'clear' ? null : this[key];
            }
        }
    };
    $scope.error = {
        classes: {
            success: 'success',
            info: 'info',
            warning: 'warning',
            danger: 'danger'
        },
        class: null,
        title: null,
        message: null,
        clear: function () {
            var keys = Object.keys(this);
            for (i=0; i<keys.length; i++) {
                var key = keys[i];
                this[key] = key != 'clear' && key != 'classes' ? null : this[key];
            }
        }
    };

    /*
     * Error messages
     */

    var
        error404 = 'Os dados não foram encontrados.',
        error500 = 'Ocorreu um erro interno no servidor.';

    /*
     * Functions
     */

    $scope.loadCity = loadCity;
    $scope.$on('accordionRepeatStarted', function() {
        InicioUI.destroyAccordion();
    });
    $scope.$on('accordionRepeatFinished', function() {
        InicioUI.loadAccordion();
    });

    function initialize() {
        $scope.error.clear();

        InicioSrvc.queryAllCities().then(function (cities) {
            $scope.cities.options = cities;
        });

        geolocation()
            .then(loadMap)
            .then(loadCityFromMap)
            .then(function (city) { // $q.all makes 'loadCityWatersources' and 'loadCards' run in parallel
                $q.all([
                    loadCityWatersources(city).then(loadHistoryData),
                    loadCards(city)
                ])
            });
    }

    function loadCity() {
        $scope.error.clear();

        //TODO peloamordedels vamos por as coordenadas no banco pra evitar essa aberração na linha abaixo
        InicioSrvc.geocodeLatLng($scope.cities.selected.name + '- PB', userLocation)
            .then(loadMap)
            .then(function () { // $q.all makes 'loadCityWatersources' and 'loadCards' run in parallel
                var city = $scope.cities.selected;
                $q.all([
                    loadCityWatersources(city).then(loadHistoryData),
                    loadCards(city)
                ])
            });
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
                switch (error.status) {
                    case 404:
                        $scope.error.class = $scope.error.classes.danger;
                        $scope.error.title = 'Falha na busca por cidade.';
                        $scope.error.message = error404;
                        break;
                    case 500:
                    default:
                        $scope.error.class = $scope.error.classes.danger;
                        $scope.error.message = error500;
                        break;
                }
                throw error;
            });
    }

    function loadCityWatersources(city) {
        $scope.watersources = null;

        return InicioSrvc.queryWatersources(city.id)
            .then (function (response) {
                if (response.status != 204) {
                    $scope.watersources = response;
                }
                else {
                    $scope.watersources = [];
                }
                return $scope.watersources;
            })
            .catch(function (error) {
                switch (error.status) {
                    case 404:
                        $scope.error.class = $scope.error.classes.warning;
                        $scope.error.message = 'Açudes:';
                        $scope.error.message = error404;
                        break;
                    case 500:
                    default:
                        $scope.error.class = $scope.error.classes.danger;
                        $scope.error.message = error500;
                        break;
                }
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

            var consumed = {
                watersource: watersource
            };

            var label = watersource.name;

            if (watersource.waterSourceMeasurements && watersource.waterSourceMeasurements.length) {
                var percent = ((watersource.waterSourceMeasurements[0].value / watersource.capacity) * 100);
                watersource['percent'] = percent;
                watersource['class'] = percent <= 5 ? 'worst' : percent > 5 && percent <= 20 ? 'bad' : percent > 20 && percent < 100 ? 'regular' : percent >= 100 ? 'best' : '';
            }

            return InicioSrvc.queryMeasurements(watersource.id, DateUtil.format(dateFormat, startDate), DateUtil.format(dateFormat, endDate))
                .then(function (response) {
                    if (response.status != 204) {
                        var measurements = response;
                    }
                    measurements.map(function (measurement) {
                        consumed[measurement.date] = measurement.value;
                    });
                    data[label] = consumed;
                    return consumed;
                })
                .catch(function (error) {
                    console.log(error);
                    throw error;
                });
        }

        function doneConsuming(consumed) {

            // Assemble the date range with dates from all watersources
            consumed.map(function (consumedMap) {
                Object.keys(consumedMap).map(function (key) {
                    if (key != 'watersource') {
                        var date = +key;
                        if (history.dateRange.indexOf(date) < 0) {
                            history.dateRange.push(date);
                        }
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
            consumed.map(function (consumedMap) {
                var line = [];
                Object.keys(consumedMap).map(function (key) {
                    if (key != 'watersource') {
                        var date = +key;
                        line[history.dateRange.indexOf(date)] = consumedMap[key];
                    }
                });

                // Push the data label to the first column
                line.splice(0,0,consumedMap['watersource'].name);

                // Get the last index, regardless of array's length
                var lastIndex = line.lastIndexOf(line.slice(-1)[0]);
                // Replacing 'undefined' with null
                for (i=0; i<=lastIndex; i++) {
                    if (line[i] === undefined) {
                        line[i] = null;
                    }
                }

                history.lines.push(line);
            });

            // load the history chart
            InicioUI.loadChart(history.dateRange, history.lines);
            return history;
        }
    }

    function loadCards(city) {

        $scope.cards.clear();

        $q.all([
            InicioSrvc.queryLitersByID(city.id),
            InicioSrvc.queryCubicMetersByID(city.id),
            InicioSrvc.queryWaterByID(city.id),
            InicioSrvc.queryPersonsByID(city.id)
        ])
            .then(function (data) {
                $scope.cards.liters = data[0];
                $scope.cards.cubicMeters = data[1];
                $scope.cards.water = data[2];
                $scope.cards.person = data[3];
            })
            .catch(function (error) {
                console.log(error);
                throw error;
            });
    }

    /**
     * RUN, SCRIPT, RUN!
     */

    initialize();

});