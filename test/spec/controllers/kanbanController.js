'use strict';

describe('Controller: KanbanCtrl', function () {

  // load the controller's module
  beforeEach(module('kanbanApp'));

  var kanbanCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    kanbanCtrl = $controller('kanbanCtrl', {
      $scope: scope
    });
  }));

});
