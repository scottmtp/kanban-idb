'use strict';

describe('Controller: CardDetailCtrl', function () {

  // load the controller's module
  beforeEach(module('kanbanApp'));

  var ctrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ctrl = $controller('CardDetailCtrl', {
      $scope: scope,
      $modalInstance: {},
      card: {},
      workflow: 's1'
    });
  }));

  it('should delete a task', function () {
    scope.card = {'tasks': ['t1', 't2', 't3']};
    
    scope.deleteTask(1);
    expect(scope.card.tasks.length).toBe(2);
    expect(scope.card.tasks[1]).toBe('t3');
  });
});
