'use strict';

angular.module('kanbanApp').controller('CardActionCtrl', ['$scope', '$modalInstance', 'card',
function($scope, $modalInstance, card) {
  //
  // on page load
  //
  $scope.card = card;
  
  //
  // view functions
  //
  
  $scope.archiveCard = function(card) {
    $modalInstance.close({'card': card, 'outcome': 'archive'});
  };
  
  $scope.deleteCard = function(card) {
    $modalInstance.close({'card': card, 'outcome': 'delete'});
  };
  
  // close dialog
  $scope.close = function(card) {
    $modalInstance.close(card);
  };
}]);