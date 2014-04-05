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
  
  var updateAndSaveAllCards = function(project, cardList, endWorkflow) {
    var promises = [];
    for (var i = 0; i < cardList.length; i++) {
      cardList[i].ordinal = i;
      cardList[i].status = endWorkflow;
      promises.push(kanbanService.saveCard(project, cardList[i]));
    }
    
    return promises;
  };
  
  var sortUpdate = function(e, data) {
    var startWorkflow = $(data.startparent).attr('data-workflow');
    var endWorkflow = $(data.endparent).attr('data-workflow');
    var $start = data.oldindex;
    var $end   = data.item.index();
    
    $scope.$apply(function () {
      if (startWorkflow === endWorkflow) {
        $scope.kanbanCards[startWorkflow].splice($end, 0, $scope.kanbanCards[startWorkflow].splice($start, 1)[0]);
      } else {
        if (typeof $destItems === 'undefined') {
          $scope.kanbanCards[endWorkflow] = [];
        }
      
        $scope.kanbanCards[endWorkflow].splice($end, 0, $scope.kanbanCards[startWorkflow].splice($start, 1)[0]);
      }
    });
    
    var promises = updateAndSaveAllCards($scope.project, $scope.kanbanCards[endWorkflow], endWorkflow);
    $q.all(promises)
      .then(function() { return kanbanService.getCards($scope.project); }).then(updateViewModelCards);
  };
  
  var updateViewModelCards = function(results) {
    $log.debug('updateViewModelCards');
    $scope.listCards = results;
    $scope.kanbanCards = _.chain(results).sortBy('ordinal').groupBy('status').value();
    $scope.archiveCards = $scope.kanbanCards['Archive'];
    if (!$scope.archiveCards) {
      $scope.archiveCards = [];
    }
    
    $('.sortable').sortable($scope.sortableOptions);
    
    // remove default binding as it can't deal with our model
    $('.sortable').sortable().unbind();
    
    // attach to update event
    $('.sortable').sortable().bind('sortupdate', sortUpdate);
    
    $scope.listCards = results;
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
    connectWith: '.connected'
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
