'use strict';

angular.module('kanbanApp').controller('CardDetailCtrl', ['$scope', '$modalInstance', 'kanbanService', 'card', 'workflow',
function($scope, $modalInstance, kanbanService, card, workflow) {
  $scope.card = card;
  $scope.workflow = workflow;
  
  $scope.addTask = function() {
    $scope.card.tasks.push($scope.card.newTask);
    $scope.card.newTask = kanbanService.getTaskTemplate();
  };
  
  $scope.closeTask = function(idx) {
    $scope.card.tasks[idx].status = 'Closed';
  };
  
  $scope.reopenTask = function(idx) {
    $scope.card.tasks[idx].status = 'Open';
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