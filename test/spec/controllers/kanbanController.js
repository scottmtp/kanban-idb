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

  it('should updateViewModelProject', function () {
    scope.updateViewModelProject('foo');
    expect(scope.project).toBe('foo');
  });
  
  it('should updateViewModelProjectList', function () {
    scope.updateViewModelProjectList('foo');
    expect(scope.projectList).toBe('foo');
  });
  
  it('should updateViewModelCards', function () {
    var results = [
      {'status': 's1', 'ordinal': 1, 'name': 's1o1'},
      {'status': 's1', 'ordinal': 2, 'name': 's1o2'},
      {'status': 's2', 'ordinal': 1, 'name': 's2o1'},
      {'status': 's2', 'ordinal': 2, 'name': 's2o2'},
      {'status': 'Archive', 'ordinal': 1, 'name': 'a1'}
    ];
    
    scope.project = {'workflow': ['s1', 's2']};
    scope.updateViewModelCards(results);
    
    expect(scope.kanbanCards['s1'].length).toBe(2);
    expect(scope.kanbanCards['s1'][1].name).toBe('s1o2');
    expect(scope.kanbanCards['s2'].length).toBe(2);
    expect(scope.kanbanCards['s2'][0].name).toBe('s2o1');
    expect(scope.kanbanCards.Archive.length).toBe(1);
  });
});
