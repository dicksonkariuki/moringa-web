// app.js
var moringaApp = angular.module('moringaApp', ['ui.router']);

moringaApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    $urlRouterProvider.otherwise('/inicio');

    $stateProvider

    // HOME STATES AND NESTED VIEWS ========================================
        .state('inicio', {
            url: '/inicio',
            templateUrl: 'moringa-web/app/components/inicio/inicio.html'
        })
        .state('acude', {
            url: '/acude',
            templateUrl: 'moringa-web/app/components/acude/acude.html'
        })
        .state('sobre', {
        url: '/sobre',
        templateUrl: 'moringa-web/app/components/sobre/sobre.html'
    });

    $locationProvider.html5Mode(true)
});