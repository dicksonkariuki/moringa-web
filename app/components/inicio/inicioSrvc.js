angular.module('routerApp').factory('InicioSrvc', function($http) {

    var geocoder;

    function geocodeCityName(latlng) {
        // Using jQuery's Deferred to return a promise
        var deferred = $.Deferred();
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
                        deferred.resolve(locality.long_name);
                        break;

                    // otherwise
                    case google.maps.GeocoderStatus.ZERO_RESULTS:
                    default:
                        // we log and throw back the error
                        console.log("Geocode was not successful for the following reason: " + status);
                        deferred.reject(status);
                        break;
                }

                // that's a messy filter because reasons
                function addressComponentsLocalityFilter(address_component) {
                    return address_component.types.indexOf('locality') > -1 || address_component.types.indexOf('administrative_area_level_2') > -1;
                }
            }
        );

        // I promise I will return something to you =)
        return deferred.promise();
    }

    function geocodeLatLng(address) {
        // Using jQuery's Deferred to return a promise
        var deferred = $.Deferred();
        // and the Geocoder from Google Maps API
        if (!geocoder) { geocoder = new google.maps.Geocoder();}
        // we ask google to geocode the data for our location
        geocoder.geocode(
            // we pass a google.maps.GeocoderRequest object as parameter
            {
                address: address
            },
            // and expect some results
            function (results, status) {
                switch (status) {
                    // in case we get the data
                    case google.maps.GeocoderStatus.OK:
                        // we filter it for the 'locality' attribute
                        latlng = results[0].geometry.location;
                        // and return it
                        deferred.resolve(latlng);
                        break;

                    // otherwise
                    case google.maps.GeocoderStatus.ZERO_RESULTS:
                    default:
                        // we log and throw back the error
                        console.log("Geocode was not successful for the following reason: " + status);
                        deferred.reject(status);
                        break;
                }
            }
        );

        // I promise I will return something to you =)
        return deferred.promise();
    }

    function queryAllCities() {
        // Using jQuery's Deferred to return a promise
        var deferred = $.Deferred();
        // and a webservice's URL
        var urlCityPerName = Properties.webserviceAddress + '/cities';
        
        // we query the webservice for the list of all cities
        $http({
            method: 'GET',
            url: urlCityPerName
        })
            .success(function(cities) {
                // and then return the full list
                deferred.resolve(cities);
            })
            .error(function (error) {
                // or throw back an error 
                deferred.reject(error);
            });
    
        // I promise I will return something to you =)
        return deferred.promise();
    }

    function queryCityByName(cityName) {
        // Using jQuery's Deferred to return a promise
        var deferred = $.Deferred();
        // and a webservice's URL
        var urlCityPerName = Properties.webserviceAddress + '/cities?name=' + cityName;

        // we query the webservice for the list of all cities matching the cityName parameter
        $http({
            method: 'GET',
            url: urlCityPerName
        })
            .success(function(cities) {
                // and then return the filtered list
                deferred.resolve(cities[0]);
            })
            .error(function (status) {
                // or throw back an error
                deferred.reject(status);
            });

        // I promise I will return something to you =)
        return deferred.promise();
    }

    function queryWatersources(cityId) {
        // Using jQuery's Deferred to return a promise
        var deferred = $.Deferred();
        // and a webservice's URL
        var urlWatersourcesPerCityId = Properties.webserviceAddress + '/cities/' + cityId + '/watersources';

        // we query the webservice for all watersources of a city given the city's ID on the cityId parameter
        $http({
            method: 'GET',
            url: urlWatersourcesPerCityId
        })
            .success(function(watersources) {
                // and then return a list of watersources
                deferred.resolve(watersources);
            })
            .error(function (error) {
                // or throw back an error
                deferred.reject(error);
            });

        // I promise I will return something to you =)
        return deferred.promise();
    }

    function queryMeasurements(watersourceId, startDate, endDate) {
        // Using jQuery's Deferred to return a promise
        var deferred = $.Deferred();
        // and a webservice's URL
        var urlWatersourceMeasurements = Properties.webserviceAddress+'/watersources/'+watersourceId+'/measurements?startDate='+startDate+'&endDate='+endDate;

        // we query the webservice for all watersources of a city given the city's ID on the cityId parameter
        $http({
            method: 'GET',
            url: urlWatersourceMeasurements
        })
            .success(function(measurements) {
                // and then return a list of watersource measurements
                deferred.resolve(measurements);
            })
            .error(function (error) {
                // or throw back an error
                deferred.reject(error);
            });

        // I promise I will return something to you =)
        return deferred.promise();
    }
    
    return {
        queryAllCities:     queryAllCities,
        geocodeCityName:    geocodeCityName,
        geocodeLatLng:      geocodeLatLng,
        queryCityByName:    queryCityByName,
        queryWatersources:  queryWatersources,
        queryMeasurements:  queryMeasurements
    };
});