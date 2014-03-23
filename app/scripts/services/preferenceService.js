'use strict';

angular.module('kanbanApp').service('preferenceService', ['dbService', function(dbService) {
  var getDefaultProjectId = function() {
    return dbService.getPreference('defaultProject');
  };
  
  var setDefaultProjectId = function(id) {
    return dbService.updatePreference({'name': 'defaultProject', 'id': id});
  };
  
  return {
    getDefaultProjectId: getDefaultProjectId,
    setDefaultProjectId: setDefaultProjectId
  };
  
}]);
