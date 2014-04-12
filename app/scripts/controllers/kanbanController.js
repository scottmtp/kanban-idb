/*global $ */
/*global _ */
'use strict';

angular.module('kanbanApp').controller('kanbanCtrl', ['$scope', '$log', '$q', '$modal', 'preferenceService', 'projectService', 'kanbanService', function($scope, $log, $q, $modal, preferenceService, projectService, kanbanService) {

  $scope.updateViewModelProject = function(result) {
    $log.debug('updateViewModelProject');
    $scope.project = result;
  };
  
  $scope.updateViewModelProjectList = function(results) {
    $log.debug('updateViewModelProjectList');
    $scope.projectList = results;
  };
  
  $scope.updateViewModelCards = function(results) {
    $log.debug('updateViewModelCards');
    $scope.listCards = _.chain(results).filter(function(c) {return c.status !== 'Archive';}).sortBy('name').value();
    $scope.kanbanCards = _.chain(results).sortBy('ordinal').groupBy('status').value();
    _.forEach($scope.project.workflow, function(workflow) {
      if (!$scope.kanbanCards[workflow]) {
        $scope.kanbanCards[workflow] = [];
      }
    });
    
    $scope.archiveCards = $scope.kanbanCards.Archive;
    if (!$scope.archiveCards) {
      $scope.archiveCards = [];
    }
  };
  
  var updateAndSaveAllCards = function(project, cardList, endWorkflow) {
    var promises = [];
    for (var i = 0; i < cardList.length; i++) {
      cardList[i].ordinal = i;
      cardList[i].status = endWorkflow;
      promises.push(kanbanService.saveCard(project, cardList[i]));
    }
    return promises;
  };
  
  var sortUpdate = function(e, ui) {
    var startWorkflow = ui.item.startWorkflow,
      endWorkflow = ui.item.sortable.droptarget.attr('data-workflow'),
      promises;

    promises = updateAndSaveAllCards($scope.project, $scope.kanbanCards[endWorkflow], endWorkflow);
    $q.all(promises)
      .then(function() { return kanbanService.getCards($scope.project); })
      .then($scope.updateViewModelCards);
  };
  
  var editCardImpl = function(aCard) {
    $log.debug('editCard');
    var modalInstance;
    
    modalInstance = $modal.open({
      templateUrl: 'views/cardDetail.html',
      controller: 'CardDetailCtrl',
      resolve: {
        card: function() {
          return aCard;
        },
        workflow: function() {
          return ['Backlog', 'In Progress', 'Done'];
        }
      }
    });
    
    modalInstance.result
      .then(function(card) { return kanbanService.saveCard($scope.project, card); })
      .then(function() { return kanbanService.getCards($scope.project); })
      .then($scope.updateViewModelCards);
  };
  
  var editProjectImpl = function(aProject) {
    $log.debug('editProject');
    var modalInstance;
    
    modalInstance = $modal.open({
      templateUrl: 'views/projectDetail.html',
      controller: 'ProjectDetailCtrl',
      resolve: {
        project: function() {
          return aProject;
        }
      }
    });
    
    modalInstance.result
      .then(function(project) {
        $scope.project = project;
        return projectService.saveProject(project);
      })
      .then(function() { return preferenceService.setDefaultProjectId($scope.project.id); })
      .then(function() { return projectService.getAllProjects(); })
      .then($scope.updateViewModelProjectList)
      .then(function() { return kanbanService.getCards($scope.project); })
      .then($scope.updateViewModelCards);
  };
  
  $scope.sortableOptions = {
    placeholder: '.card',
    connectWith: '.cardHolder',
    distance: 5,
    stop: sortUpdate,
    start: function(event, ui) {
      ui.item.startWorkflow = ui.item.parent().attr('data-workflow');
    }
  };
  
  $scope.toggleCard = function(event) {
    if ($(event.target).hasClass('card')) {
      $(event.target).find('span.cardStory').toggleClass('hidden');
    } else {
      $(event.target).parent().parent().find('span.cardStory').toggleClass('hidden');
    }
  };
  
  $scope.createProject = function() {
    var modalProject = projectService.getProjectTemplate();
    editProjectImpl(modalProject);
  };
  
  $scope.editProject = function(project) {
    var modalProject = angular.copy(project);
    editProjectImpl(modalProject);
  };
  
  $scope.selectProject = function(project) {
    if (project.id !== $scope.project.id) {
      $scope.project = project;
      preferenceService.setDefaultProjectId($scope.project.id)
        .then(function() { return kanbanService.getCards($scope.project); })
        .then($scope.updateViewModelCards);
    }
  };
  
  $scope.actions = function(aCard) {
    $log.debug('actions');
    var modalInstance;
    modalInstance = $modal.open({
      templateUrl: 'views/cardActions.html',
      controller: 'CardActionCtrl',
      resolve: {
        card: function() {
          return aCard;
        }
      }
    });
    
    modalInstance.result
      .then(function(result) {
        $log.debug('action outcome: ' + result.outcome);
        if (result.outcome === 'delete') {
          kanbanService.deleteCard($scope.project, result.card);
        } else if (result.outcome === 'archive') {
          result.card.status = 'Archive';
          kanbanService.saveCard($scope.project, result.card);
        }
      })
      .then(function() { return kanbanService.getCards($scope.project); })
      .then($scope.updateViewModelCards);
      
  };
  
  $scope.editCard = function(card) {
    var modalCard = angular.copy(card);
    editCardImpl(modalCard);
  };
  
  $scope.createCard = function() {
    var modalCard = kanbanService.getCardTemplate('Backlog');
    editCardImpl(modalCard);
  };
    
  // update project list
  projectService.getAllProjects().then($scope.updateViewModelProjectList);
  
  // get default project, or create new one if no projects exist
  preferenceService.getDefaultProjectId()
    .then(
      function(results) {
        if (!!results) {
          $scope.defaultProjectId = results.id;
        } else {
          var projectTemplate = projectService.getProjectTemplate();
          $scope.defaultProjectId = projectTemplate.id;
          return projectService.saveProject(projectTemplate);
        }
      })
    .then( function() { return preferenceService.setDefaultProjectId($scope.defaultProjectId); })
    .then( function() { return projectService.getProject($scope.defaultProjectId); })
    .then( $scope.updateViewModelProject )
    .then( function() { return kanbanService.getCards($scope.project); })
    .then( $scope.updateViewModelCards );
}]);
