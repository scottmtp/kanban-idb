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
    $scope.projectList = results;
  };
  
  var getStatus = function(s) {
    return s.replace(/ /g, '');
  };
  
  var sortUpdate = function(e, data) {
    var startWorkflow = $(data.startparent).attr('data-workflow');
    var endWorkflow = $(data.endparent).attr('data-workflow');
    
    var $start = data.oldindex;
    var $end   = data.item.index();
    $log.info('s: ' + $start + ', e: ' + $end);
    
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
    
    var promises = [];
    for (var i = 0; i < $scope.kanbanCards[endWorkflow].length; i++) {
      $scope.kanbanCards[endWorkflow][i].ordinal = i;
      $scope.kanbanCards[endWorkflow][i].status = endWorkflow
      promises.push(kanbanService.saveCard($scope.project, $scope.kanbanCards[endWorkflow][i]));
    }
    
    $q.all(promises)
      .then(function() {
        return kanbanService.getCards($scope.project);
      }).then(updateViewModelCards);
  };
  
  var updateViewModelCards = function(results) {
    $log.debug('updateViewModelCards');
    $scope.listCards = results;
    $scope.kanbanCards = _.chain(results).sortBy('ordinal').groupBy('status').value();
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
      .then(function(card) {
        return kanbanService.saveCard($scope.project, card);
      })
      .then(function() {
        return kanbanService.getCards($scope.project);
      })
      .then(updateViewModelCards);
  };
  
  //
  // scope
  //
  $scope.sortableOptions = {
    connectWith: '.connected'
  };
  
  $scope.createProject = function() {
    $log.debug('createProject');
  };
  
  $scope.editProject = function(project) {
    $log.debug('editProject: ' + JSON.stringify(project));
  };
  
  $scope.switchProject = function() {
    $log.debug('switchProject');
  };
  
  $scope.editCard = function(card) {
    var modalCard = angular.copy(card);
    editCardImpl(modalCard);
  };
  
  $scope.createCard = function() {
    $log.debug('createCard');
    var modalCard = kanbanService.getCardTemplate('Backlog');
    editCardImpl(modalCard);
  };
  
  $scope.getTableStyle= function() {
    var rowHeight=30;
    var headerHeight=45;
    var newHeight = !!$scope.listCards.length ? $scope.listCards.length * rowHeight + headerHeight : 400;
    return {
      height: newHeight + "px"
    };
  };
  
  //
  // page load
  //
  projectService.getAllProjects().then(updateViewModelProjectList);
  
  // ng-grid
  $scope.listCards = [];
  $scope.gridOptions = { 
    data: 'listCards',
    columnDefs: [{field:'name', displayName:'Name'},
      {field:'story', displayName:'Story'},
      {field:'points', displayName:'Points'},
      {field:'status', displayName:'Status'}]
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

angular.module('kanbanApp').controller('CardDetailCtrl', ['$scope', '$modalInstance', 'kanbanService', 'card', 'workflow',
function($scope, $modalInstance, kanbanService, card, workflow) {
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
    $scope.card.newTask = kanbanService.getTaskTemplate();
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