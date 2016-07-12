// app.js
var moringaApp = angular.module('moringaApp', ['ui.router']);

moringaApp.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/inicio');

    $stateProvider

    // HOME STATES AND NESTED VIEWS ========================================
        .state('inicio', {
            url: '/inicio',
            templateUrl: 'app/components/inicio/inicio.html'
        })
        .state('acude', {
            url: '/acude',
            templateUrl: 'app/components/acude/acude.html'
        })
        .state('sobre', {
        url: '/sobre',
        templateUrl: 'app/components/sobre/sobre.html'
    });

});