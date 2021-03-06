/*global $ */
/*global _ */
'use strict';

angular.module('kanbanApp').controller('kanbanCtrl',
  ['$scope', '$log', '$q', '$modal', '$timeout', '$interval', 'preferenceService', 'projectService', 'kanbanService', 'settingsService', 'replicatorService',
   function($scope, $log, $q, $modal, $timeout, $interval, preferenceService, projectService, kanbanService, settingsService, replicatorService) {

  function error(err) {
    $log.error(err);
  }

  var doEditCard = function(aCard) {
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
      .then($scope.updateCards)
      .then(doReplicate)
      .catch(error);
  };

  var doEditProject = function(aProject) {
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
        $scope.defaultProjectPref.projectId = project._id;
        return projectService.saveProject(project);
      })
      .then(function(resultOfSave) {
        $scope.project._rev = resultOfSave.rev;
      })
      .then(function() {
        return preferenceService.setPreference($scope.defaultProjectPref);
      })
      .then(function(resultOfSave) {
        $scope.defaultProjectPref._rev = resultOfSave.rev;
      })
      .then(function() {
        return projectService.getAllProjects();
      })
      .then($scope.updateProjectList)
      .then(function() {
        return kanbanService.getCards($scope.project);
      })
      .then($scope.updateCards)
      .then(doReplicatorJoin)
      .then(doReplicate)
      .catch(error);
  };

  var onReplicatorUpdates = function() {
    return kanbanService.getCards($scope.project).then($scope.updateCards);
  };
  
  var doReplicatorJoin = function() {
    if ($scope.project.signaller) {
      return replicatorService.join($scope.project, onReplicatorUpdates);
    }

    return Promise.resolve();
  };

  var doReplicate = function() {
    if ($scope.project.signaller) {
      return replicatorService.replicate($scope.project);
    }

    return Promise.resolve();
  };

  $scope.updateProject = function(result) {
    $log.debug('updateProject: ' + JSON.stringify(result));
    $scope.project = result;
  };

  $scope.updateSettings = function(result) {
    $log.debug('updateSettings: ' + JSON.stringify(result));
    if (!!result) {
      $scope.projectWorkflow = result.steps;
    } else {
      $scope.projectWorkflow = settingsService.getKanbanWorkflowSteps();
      return settingsService.setWorkflowSetting($scope.project, $scope.projectWorkflow);
    }
  };

  $scope.updateProjectList = function(results) {
    $log.debug('updateProjectList: ' + JSON.stringify(results));
    $scope.projectList = results;
  };

  $scope.updateCards = function(results) {
    $log.debug('updateCards');
    $scope.listCards = _.chain(results).filter(function(c) {return c.status !== 'Archive';}).sortBy('name').value();
    $scope.kanbanCards = _.chain(results).sortBy('ordinal').groupBy('status').value();
    _.forEach($scope.projectWorkflow, function(workflow) {
      if (!$scope.kanbanCards[workflow]) {
        $scope.kanbanCards[workflow] = [];
      }
    });

    $scope.archiveCards = $scope.kanbanCards.Archive;
    if (!$scope.archiveCards) {
      $scope.archiveCards = [];
    }
  };

  $scope.sortableOptions = {
    placeholder: '.card',
    connectWith: '.cardHolder',
    distance: 5,
    stop: function(e, ui) {
      var endWorkflow = ui.item.sortable.droptarget.attr('data-workflow'),
        promises;

      kanbanService.setStatusAndOrdinal($scope.project, $scope.kanbanCards[endWorkflow], endWorkflow);
      promises = kanbanService.saveCards($scope.project, $scope.kanbanCards[endWorkflow]);
      $q.all(promises)
        .then(function() { return kanbanService.getCards($scope.project); })
        .then($scope.updateCards)
        .then(doReplicate)
        .catch(error);
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
    doEditProject(modalProject);
  };

  $scope.editProject = function(project) {
    var modalProject = angular.copy(project);
    doEditProject(modalProject);
  };

  $scope.selectProject = function(project) {
    if (project._id !== $scope.project._id) {
      $scope.project = project;

      preferenceService.getDefaultProjectPref()
      .then(function(results) {
        $scope.defaultProjectPref = results;
        $scope.defaultProjectPref.projectId = $scope.project._id;
        return preferenceService.setPreference($scope.defaultProjectPref);
      })
      .then(function() {
        return kanbanService.getCards($scope.project);
      })
      .then($scope.updateCards)
      .then(doReplicatorJoin)
      .then(doReplicate)
      .catch(error);
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
          return kanbanService.deleteCard($scope.project, result.card);
        } else {
          if (result.outcome === 'archive') {
            result.card.status = 'Archive';
          }

          return kanbanService.saveCard($scope.project, result.card);
        }
      })
      .then(function() {
        return kanbanService.getCards($scope.project);
      })
      .then($scope.updateCards)
      .then(doReplicate)
      .catch(error);
  };

  $scope.editCard = function(card) {
    var modalCard = angular.copy(card);
    doEditCard(modalCard);
  };

  $scope.createCard = function() {
    var modalCard = kanbanService.getCardTemplate('Backlog');
    doEditCard(modalCard);
  };

  // update project list
  projectService.getAllProjects()
    .then($scope.updateProjectList)
    .catch(error);

  // get default project, or create new one if no projects exist
  preferenceService.getDefaultProjectPref()
    .then(
      function(results) {
        var projectTemplate, defaultProjectPrefTemplate;
        $log.debug('getDefaultProjectId: ' + JSON.stringify(results));

        if (!!results) {
          $scope.defaultProjectPref = results;
        } else {
          projectTemplate = projectService.getProjectTemplate();
          defaultProjectPrefTemplate = preferenceService.getDefaultProjectPrefTemplate();
          defaultProjectPrefTemplate.projectId = projectTemplate._id;
          $scope.defaultProjectPref = defaultProjectPrefTemplate;

          return projectService.saveProject(projectTemplate)
            .then(function() {
              return preferenceService.setPreference($scope.defaultProjectPref);
            })
            .then(function(resultOfSave) {
              $scope.defaultProjectPref._rev = resultOfSave.rev;
            });
        }
      })
    .then(function() {
      return projectService.getProject($scope.defaultProjectPref.projectId);
    })
    .then($scope.updateProject)
    .then( function() {
      return settingsService.getWorkflowSetting($scope.project);
    })
    .then($scope.updateSettings)
    .then(function() {
      return kanbanService.getCards($scope.project);
    })
    .then($scope.updateCards)
    .then(doReplicatorJoin)
    .then(doReplicate)
    .catch(error);

  $scope.connectedPeers = 0;
  var updateConnectedPeers = function() {
    $scope.connectedPeers = replicatorService.connectedPeers();
  };

  $interval(updateConnectedPeers, 2000);

}]);
