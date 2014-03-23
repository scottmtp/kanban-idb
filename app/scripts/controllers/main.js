'use strict';

angular.module('kanbanApp').controller('kanbanCtrl', ['$scope', '$log', 'preferenceService', 'projectService', 'kanbanService', function($scope, $log, preferenceService, projectService, kanbanService) {
  
  var updateViewModelProject = function(result) {
    $log.info('updateViewModelProject');
    $scope.project = result;
  };
  
  var updateViewModelCards = function(results) {
    $log.info('updateViewModelCards');
    $scope.cards = results;
  };
  
  preferenceService.getDefaultProjectId().then(
    function(results) {
      if (!!results) {
        $scope.defaultProjectId = results.id;
      } else {
        var projectTemplate = projectService.getProjectTemplate();
        $scope.defaultProjectId = projectTemplate.id;
        return projectService.saveProject(projectTemplate);
      }
    }
  ).then(
    function() {
      return preferenceService.setDefaultProjectId($scope.defaultProjectId);
    }
  ).then(
    function() {
      return projectService.getProject($scope.defaultProjectId);
    }
  ).then(
    updateViewModelProject
  ).then(
    function() {
      return kanbanService.getCards($scope.project);
    }
  ).then(
    updateViewModelCards
  );
  
  
}]);
