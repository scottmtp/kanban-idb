'use strict';

angular.module('kanbanApp').controller('ProjectDetailCtrl', ['$scope', '$modalInstance', 'project',
function($scope, $modalInstance, project) {
  //
  // on page load
  //
  $scope.project = project;
  
  //
  // view functions
  //
  
  // save changes
  $scope.save = function(project) {
    $modalInstance.close(project);
  };

  // cancel changes
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
}]);