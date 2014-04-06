'use strict';

angular.module('kanbanApp').controller('CardActionCtrl', ['$scope', '$modalInstance', 'card',
function($scope, $modalInstance, card) {
  $scope.card = card;

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