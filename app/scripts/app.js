'use strict';

angular.module('kanbanApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'uuid4'
])
  .config(function($routeProvider) {
    $routeProvider
      .when('/kanban', {
        templateUrl: '/views/kanban.html',
        controller: 'kanbanCtrl'
      })
      .otherwise({
        redirectTo: '/kanban'
      });
  });
