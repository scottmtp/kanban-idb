'use strict';

angular.module('kanbanApp').controller('CardActionCtrl', ['$scope', '$modalInstance', 'card',
function($scope, $modalInstance, card) {
  $scope.card = card;

  $scope.closeTask = function(idx) {
    $scope.card.tasks[idx].status = 'Closed';
  };
  
  $scope.reopenTask = function(idx) {
    $scope.card.tasks[idx].status = 'Open';
  };
  
  $scope.deleteTask = function(idx) {
    $scope.card.tasks.splice(idx, 1);
  };
  
  $scope.archiveCard = function(card) {
    $modalInstance.close({'card': card, 'outcome': 'archive'});
  };
  
  $scope.deleteCard = function(card) {
    $modalInstance.close({'card': card, 'outcome': 'delete'});
  };
  
  $scope.close = function(card) {
    $modalInstance.close(card);
  };
}]);