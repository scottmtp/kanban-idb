'use strict';

angular.module('kanbanApp').service('settingsService', ['dbService', function(dbService) {
  var getGenericWorkflowSteps = function() {
    return ['To Do', 'Doing', 'Done'];
  };

  var getKanbanWorkflowSteps = function() {
    return ['Backlog', 'In Progress', 'Done'];
  };

  var getScrumWorkflowSteps = function() {
    return ['Backlog', 'Sprint', 'In Progress', 'Done'];
  };

  var getWorkflowSetting = function(project) {
    return dbService.getSetting(project, 'workflow');
  };

  var setWorkflowSetting = function(project, steps) {
    return dbService.updateSetting(project, {'_id': 'workflow', 'steps': steps});
  };

  return {
    getGenericWorkflowSteps: getGenericWorkflowSteps,
    getKanbanWorkflowSteps: getKanbanWorkflowSteps,
    getScrumWorkflowSteps: getScrumWorkflowSteps,
    getWorkflowSetting: getWorkflowSetting,
    setWorkflowSetting: setWorkflowSetting,
  };

}]);
