// app.js
var moringaApp = angular.module('moringaApp', ['ui.router']);

moringaApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider

    // HOME STATES AND NESTED VIEWS ========================================
        .state('inicio', {
            url: '/',
            templateUrl: 'app/components/inicio/inicio.html'
        })
/*        .state('acude', {
            url: '/acude',
            templateUrl: 'app/components/acude/acude.html'
        })*/
        .state('sobre', {
            url: '/sobre',
            templateUrl: 'app/components/sobre/sobre.html'
        });

    // $locationProvider.html5Mode(true);
});