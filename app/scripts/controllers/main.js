/*global $ */
/*global _ */
'use strict';

angular.module('kanbanApp').controller('kanbanCtrl', ['$scope', '$log', '$q', '$modal', 'preferenceService', 'projectService', 'kanbanService', function($scope, $log, $q, $modal, preferenceService, projectService, kanbanService) {
  
  //
  // private functions
  //
  var updateViewModelProject = function(result) {
    $log.debug('updateViewModelProject');
    $scope.project = result;
  };
  
  var updateViewModelProjectList = function(results) {
    $log.debug('updateViewModelProjectList');
    $scope.projectList = results;
  };
  
  var updateAndSaveAllCards = function(project, cardList, endWorkflow, start) {
    var promises = [];
    for (var i = start; i < cardList.length; i++) {
      cardList[i].ordinal = i;
      cardList[i].status = endWorkflow;
      promises.push(kanbanService.saveCard(project, cardList[i]));
    }
    
    return promises;
  };
  
  var sortUpdate = function(e, ui) {
    // only run callback for 'drop' list
    if (this === ui.item.parent()[0]) {
      var endWorkflow = ui.item.parent().attr('data-workflow');
      var startWorkflow = ui.item.startWorkflow;
    
      var $start = ui.item.startPos;
      var $end   = ui.item.index();
      $log.info('sw: ' + startWorkflow + ' ew: ' + endWorkflow + ' s: ' + $start + ' e: ' + $end);
      
      var removed;
      if (startWorkflow === endWorkflow) {
        removed = $scope.kanbanCards[startWorkflow].splice($start, 1)[0];
        $scope.kanbanCards[startWorkflow].splice($end, 0, removed);
      } else {
        if (typeof $scope.kanbanCards[endWorkflow] === 'undefined') {
          $scope.kanbanCards[endWorkflow] = [];
        }
        removed = $scope.kanbanCards[startWorkflow].splice($start, 1)[0];
        $scope.kanbanCards[endWorkflow].splice($end, 0, removed);
      }
      
      var promises = updateAndSaveAllCards($scope.project, $scope.kanbanCards[endWorkflow], endWorkflow, $end);
      $q.all(promises)
        .then(function() { return kanbanService.getCards($scope.project); })
        .then(updateViewModelCards);
    }
  };
  
  var updateViewModelCards = function(results) {
    $log.debug('updateViewModelCards');
    $scope.listCards = results;
    $scope.kanbanCards = _.chain(results).sortBy('ordinal').groupBy('status').value();
    $scope.archiveCards = $scope.kanbanCards.Archive;
    if (!$scope.archiveCards) {
      $scope.archiveCards = [];
    }
    
    $('.sortable').sortable($scope.sortableOptions);
  };
  
  var editCardImpl = function(aCard) {
    $log.debug('editCard');
    var modalInstance;
    
    modalInstance = $modal.open({
      templateUrl: '/views/carddetail.html',
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
      .then(updateViewModelCards);
  };
  
  var editProjectImpl = function(aProject) {
    $log.debug('editProject');
    var modalInstance;
    
    modalInstance = $modal.open({
      templateUrl: '/views/projectDetail.html',
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
      .then(updateViewModelProjectList)
      .then(function() { return kanbanService.getCards($scope.project); })
      .then(updateViewModelCards);
  };
  
  //
  // scope
  //
  $scope.sortableOptions = {
    placeholder: '.card',
    connectWith: '.cardHolder',
    distance: 5,
    update: sortUpdate,
    start: function(event, ui) {
      ui.item.startPos = ui.item.index();
      ui.item.startWorkflow = ui.item.parent().attr('data-workflow');
    },
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
        .then(updateViewModelCards);
    }
  };
  
  $scope.actions = function(aCard) {
    $log.debug('actions');
    var modalInstance;
    modalInstance = $modal.open({
      templateUrl: '/views/cardActions.html',
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
      .then(updateViewModelCards);
      
  };
  
  $scope.editCard = function(card) {
    var modalCard = angular.copy(card);
    editCardImpl(modalCard);
  };
  
  $scope.createCard = function() {
    var modalCard = kanbanService.getCardTemplate('Backlog');
    editCardImpl(modalCard);
  };
  
  $scope.getTableStyle= function() {
    var rowHeight=30;
    var headerHeight=45;
    var newHeight = !!$scope.listCards.length ? $scope.listCards.length * rowHeight + headerHeight : 400;
    return {
      height: newHeight + 'px'
    };
  };
  
  //
  // page load
  //
  
  // ng-grid
  $scope.listCards = [];
  $scope.gridOptions = {
    data: 'listCards',
    columnDefs: [{field:'name', displayName:'Name', width: 120},
      {field:'story', displayName:'Story', width: 480 },
      {field:'points', displayName:'Points', width: 90 },
      {field:'status', displayName:'Status', width: 90 }]
  };
  
  $scope.archiveCards = [];
  $scope.archiveGridOptions = {
    data: 'archiveCards',
    columnDefs: [{field:'name', displayName:'Name', width: 120},
      {field:'story', displayName:'Story', width: 480 },
      {field:'points', displayName:'Points', width: 90 },
      {field:'status', displayName:'Status', width: 90 }]
  };
  
  // update project list
  projectService.getAllProjects().then(updateViewModelProjectList);
  
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
    .then( updateViewModelProject)
    .then( function() { return kanbanService.getCards($scope.project); })
    .then( updateViewModelCards );
}]);
