'use strict';

angular.module('kanbanApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'ui.utils',
  'dialogs',
  'uuid4',
  'htmlSortable'
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
  }).run(function($rootScope) {
    $rootScope._ = window._;
  });
