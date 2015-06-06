'use strict';

angular.module('kanbanApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'ui.utils',
  'dialogs.main',
  'uuid4',
  'ui.sortable',
  'pouchdb'
])
  .config(function($routeProvider) {
    $routeProvider
      .when('/kanban', {
        templateUrl: 'views/kanban.html',
        controller: 'kanbanCtrl'
      })
      .otherwise({
        redirectTo: '/kanban'
      });
  }).run(function($rootScope) {
    $rootScope._ = window._;
  });
