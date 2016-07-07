angular.module('routerApp').factory('InicioSrvc', function($http, $q) {

    var geocoder;

    function geocodeCityName(latlng) {
        // Using AngularJS's 'defer' to return a promise
        var defer = $q.defer();
        // and the Geocoder from Google Maps API
        if (!geocoder) { geocoder = new google.maps.Geocoder();}
        // we ask google to geocode the data for our location
        geocoder.geocode(
            // we pass a GeocoderRequest object as parameter
            {
                location: latlng
            },
            // and expect some results
            function (results, status) {
                switch (status) {
                    // in case we get the data
                    case google.maps.GeocoderStatus.OK:
                        // we filter it for the 'locality' attribute
                        locality = results[0].address_components.filter(addressComponentsLocalityFilter)[0];
                        // and return it
                        defer.resolve(locality.long_name);
                        break;

                    // otherwise
                    case google.maps.GeocoderStatus.ZERO_RESULTS:
                    default:
                        // we log and throw back the error
                        console.log("Geocode was not successful for the following reason: " + status);
                        defer.reject(status);
                        break;
                }

                // that's a messy filter because reasons
                function addressComponentsLocalityFilter(address_component) {
                    return address_component.types.indexOf('locality') > -1 || address_component.types.indexOf('administrative_area_level_2') > -1;
                }
            }
        );

        // I promise I will return something to you =)
        return defer.promise;
    }

    function geocodeLatLng(address, latlng) {
        // Using AngularJS's 'defer' to return a promise
        var defer = $q.defer();
        // and the Geocoder from Google Maps API
        if (!geocoder) { geocoder = new google.maps.Geocoder();}
        // we ask google to geocode the data for our location
        geocoder.geocode(
            // we pass a google.maps.GeocoderRequest object as parameter
            {
                address: address,
                componentRestrictions: {
                    country: 'BR'
                }
            },
            // and expect some results
            function (results, status) {
                switch (status) {
                    // in case we get the data
                    case google.maps.GeocoderStatus.OK:
                        // we filter it for the 'locality' attribute
                        latlng = results[0].geometry.location;
                        // and return it
                        defer.resolve(latlng);
                        break;

                    // otherwise
                    case google.maps.GeocoderStatus.ZERO_RESULTS:
                    default:
                        // we log and throw back the error
                        console.log("Geocode was not successful for the following reason: " + status);
                        defer.reject(status);
                        break;
                }
            }
        );

        // I promise I will return something to you =)
        return defer.promise;
    }

    function queryAllCities() {
        // Using a webservice's URL
        var urlCityPerName = Properties.webserviceAddress + '/cities';
        
        // we query the webservice for the list of all cities
        return $http({
            method: 'GET',
            url: urlCityPerName
        })
            .then(function(response) {
                // and then return the filtered list
                return response.data;
            });
    }

    //retorna a quantidade de metros cubicos por pessoa de uma cidade.
    function queryLitersByID(cityId) {
        // Using a webservice's URL
        var urlLitersPerCityById = Properties.webserviceAddress + '/cities/' + cityId + '/liters';

        // we query the webservice for the list of all cities matching the cityName parameter
        return $http({
            method: 'GET',
            url: urlLitersPerCityById
        })
            .then(function(response) {
                // and then return the filtered list
                return response.data;
            });
    }

    //
    function queryWaterByID(cityId) {
        // Using a webservice's URL
        var urlWaterById = Properties.webserviceAddress + '/cities/' + cityId + '/water';

        // we query the webservice for the list of all cities matching the cityName parameter
        return $http({
            method: 'GET',
            url: urlWaterById
        })
            .then(function(response) {
                // and then return the filtered list
                return response.data;
            });
    }

    function queryCubicMetersByID(cityId) {
        // Using a webservice's URL
        var urlCubicMetersById = Properties.webserviceAddress + '/cities/' + cityId + '/cubicMeters ';

        // we query the webservice for the list of all cities matching the cityName parameter
        return $http({
            method: 'GET',
            url: urlCubicMetersById
        })
            .then(function(response) {
                // and then return the filtered list
                return response.data;
            });
    }

    function queryPersonsByID(cityId) {
        // Using a webservice's URL
        var urlPersonsById = Properties.webserviceAddress + '/cities/' + cityId + '/persons';

        // we query the webservice for the list of all cities matching the cityName parameter
        return $http({
            method: 'GET',
            url: urlPersonsById
        })
            .then(function(response) {
                // and then return the filtered list
                return response.data;
            });
    }

    function queryCityByName(cityName) {
        // Using a webservice's URL
        var urlCityPerName = Properties.webserviceAddress + '/cities?name=' + cityName;

        // we query the webservice for the list of all cities matching the cityName parameter
        return $http({
            method: 'GET',
            url: urlCityPerName
        })
            .then(function(response) {
                // and then return the filtered city
                var cities = response.data;
                return cities[0];
            });
    }

    function queryWatersources(cityId) {
        // Using a webservice's URL
        var urlWatersourcesPerCityId = Properties.webserviceAddress + '/cities/' + cityId + '/watersources?lastMeasurements=1';

        // we query the webservice for all watersources of a city given the city's ID on the cityId parameter
        return $http({
            method: 'GET',
            url: urlWatersourcesPerCityId
        })
            .then(function(response) {
                // and then return a list of watersources
                return response.data;
            });
    }

    function queryMeasurements(watersourceId, startDate, endDate) {
        // Using a webservice's URL
        var urlWatersourceMeasurements = Properties.webserviceAddress+'/watersources/'+watersourceId+'/measurements?startDate='+startDate+'&endDate='+endDate;

        // we query the webservice for all watersources of a city given the city's ID on the cityId parameter
        return $http({
            method: 'GET',
            url: urlWatersourceMeasurements
        })
            .then(function(response) {
                    // and then return a list of watersource measurements
                    return response.data;
            });
    }
    
    return {
        queryAllCities:     queryAllCities,
        geocodeCityName:    geocodeCityName,
        geocodeLatLng:      geocodeLatLng,
        queryCityByName:    queryCityByName,
        queryWatersources:  queryWatersources,
        queryMeasurements:  queryMeasurements,
        queryLitersByID: queryLitersByID,
        queryCubicMetersByID: queryCubicMetersByID,
        queryWaterByID: queryWaterByID,
        queryPersonsByID: queryPersonsByID
    };
});