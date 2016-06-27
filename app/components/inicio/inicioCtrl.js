angular.module('routerApp').controller('InicioCtrl', function ($scope, InicioSrvc) {

    $scope.inputSearch = '';
    $scope.city = {};
    $scope.watersource = {};
    $scope.watersources = [];

    $scope.loadWatersourceData = loadWatersourceData;
    $scope.mapSearch = mapSearch;
    $scope.searchCity = searchCity;

    var map;

    initialize();



    $scope.citiesToSelect = {
        citySelected: null,
        cityAvailableOptions: null
    };

    InicioSrvc.queryAllCities().then(function (cities) {
        $scope.citiesToSelect.cityAvailableOptions = cities;

        $(document).ready(function() {
            $("#select2").select2();
        });
    });

    function searchCity(city) {
        InicioSrvc.queryCityByName(city).then(queryCityByNameSuccess,queryCityByNameError);
    }

    function initialize() {
        geolocation()
            .then(loadMap)
            .then(loadCityData)
            .then(loadCityWatersources)
            .then(loadWatersourceData);
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
                .then(loadCityData)
                .then(loadCityWatersources)
                .then(loadWatersourceData);
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

        // loadCityData().then(loadCityWatersources).then(loadWatersourceData);
    }

    function loadCityData(map) {
        var deferred = $.Deferred();

        InicioSrvc.geocodeCityName(map.center).then(geocodeCitySuccess, geocodeCityError);

        return deferred.promise();

        function geocodeCitySuccess(cityName) {

            $scope.inputSearch = cityName;
            InicioSrvc.queryCityByName(cityName).then(queryCityByNameSuccess, queryCityByNameError);

            function queryCityByNameSuccess(city) {
                $scope.city = city;
                deferred.resolve(city);
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
            $scope.watersource = watersources[0];
            deferred.resolve($scope.watersource);
        }

        function queryWatersourcesError(error) {
            console.log(error);
            deferred.reject(error);
        }
    }

    function loadWatersourceData(watersource) {
        console.log(watersource);
    }

    var chart = c3.generate({
        data: {
            x: 'x',
    //        xFormat: '%Y%m%d', // 'xFormat' can be used as custom format of 'x'
            columns: [
                ['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06'],
    //            ['x', '20130101', '20130102', '20130103', '20130104', '20130105', '20130106'],
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 130, 340, 200, 500, 250, 350]
            ]
        },
        subchart : {
            show : true
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%Y-%m-%d'
                }
            }
        }
    });

});