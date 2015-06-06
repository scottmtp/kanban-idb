'use strict';

angular.module('kanbanApp').service('preferenceService', ['dbService', function(dbService) {
  var getDefaultProjectPrefTemplate = function() {
    return {'_id': 'defaultProject'};
  }

  var getDefaultProjectPref = function() {
    return dbService.getPreference('defaultProject');
  };

  var setPreference = function(pref) {
    return dbService.updatePreference(pref);
  };

  return {
    getDefaultProjectPref: getDefaultProjectPref,
    getDefaultProjectPrefTemplate: getDefaultProjectPrefTemplate,
    setPreference: setPreference
  };

}]);
