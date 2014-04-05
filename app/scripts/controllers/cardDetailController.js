'use strict';

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