'use strict';

angular.module('kanbanApp').controller('kanbanCtrl', ['$scope', '$log', '$modal', 'preferenceService', 'projectService', 'kanbanService', function($scope, $log, $modal, preferenceService, projectService, kanbanService) {
  
  var updateViewModelProject = function(result) {
    $log.info('updateViewModelProject');
    $scope.project = result;
  };
  
  var updateViewModelCards = function(results) {
    $log.info('updateViewModelCards');
    $scope.cards = results;
  };
  
  $scope.createProject = function() {
    $log.info('createProject');
  };
  
  $scope.editProject = function(project) {
    $log.info('editProject: ' + JSON.stringify(project));
  };
  
  $scope.switchProject = function() {
    $log.info('switchProject');
  };
  
  $scope.createCard = function() {
    $log.info('createCard');
    var modalInstance;
    
    var modalCard = kanbanService.getCardTemplate('Backlog');
    modalInstance = $modal.open({
      templateUrl: '/views/carddetail.html',
      controller: 'CardDetailCtrl',
      resolve: {
        card: function() {
          return modalCard;
        },
        workflow: function() {
          return ['Backlog', 'In Progress', 'Done'];
        }
      }
    });
    
    modalInstance.result.then(
      function() {
        return kanbanService.getCards($scope.project);
      }
    ).then(updateViewModelCards);
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

angular.module('kanbanApp').controller('CardDetailCtrl', ['$scope', '$modalInstance', 'card', 'workflow',
function($scope, $modalInstance, card, workflow) {
  //
  // on page load
  //
  $scope.card = card;
  $scope.workflow = workflow;
  
  //
  // view functions
  //
  
  $scope.addTask = function() {
    $scope.card.tasks.push($scope.card.newTask);
    $scope.card.newTask = '';
  };
  
  $scope.deleteTask = function(idx) {
    $scope.card.tasks.splice(idx, 1);
  };
  
  // save changes
  $scope.save = function(card) {
    $modalInstance.close(card);
  };

  // cancel changes
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
}]);