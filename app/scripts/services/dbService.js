/*global db:false */
'use strict';

angular.module('kanbanApp').service('dbService', ['$log', '$q', '$rootScope',
  function dbService($log, $q, $rootScope) {
    // Use the global database
    var selectGlobal = function() {
      $log.info('Switching to global database.');
      var promise = db.open({
        server: 'kanban_global',
        version: 1,
        schema: {
          preference: {
            key: {
              keyPath: 'name',
              autoIncrement: false
            },
            indexes: {
              name: {
                unique: true
              },
            }
          },

          project: {
            key: {
              keyPath: 'id',
              autoIncrement: false
            },
            indexes: {
              id: {
                unique: true
              },
            }
          },

        }
      });

      return promise;
    };

    // Use a project database
    var selectProject = function(dbName) {
      $log.info('selectProject db: ' + dbName);
      var promise = db.open({
        server: dbName,
        version: 1,
        schema: {
          setting: {
            key: {
              keyPath: 'name',
              autoIncrement: false
            },
            indexes: {
              name: {
                unique: true
              },
            }
          },

          card: {
            key: {
              keyPath: 'id',
              autoIncrement: false
            },
            indexes: {
              id: {
                unique: true
              },
              status: {
                unique: false
              },
            }
          },

        }
      });

      return promise;
    };

    // wrap db.js in angular promise
    var dbRun = function(serverPromise, queryFunction) {
      var deferred = $q.defer();

      var doneFunction = function(results) {
        $rootScope.$apply(function() {
          deferred.resolve(results);
        });
      };

      var failFunction = function(result) {
        $log.warn('Card failed: ' + JSON.stringify(result));
      };

      serverPromise.then(queryFunction).then(doneFunction, failFunction);

      return deferred.promise;
    };

    //
    // Generic API
    //

    // Find one object
    var getObject = function(serverPromise, collection, id) {
      var query = function(s) {
        return s[collection].get(id);
      };

      return dbRun(serverPromise, query);
    };

    // Get all objects
    var getAllObjects = function(serverPromise, collection) {
      var query = function(s) {
        return s[collection].query().all().execute();
      };

      return dbRun(serverPromise, query);
    };

    // Update or insert object
    var updateObject = function(serverPromise, collection, obj) {
      var query = function(s) {
        return s[collection].update(obj);
      };

      return dbRun(serverPromise, query);
    };

    // Delete object
    var removeObject = function(serverPromise, collection, id) {
      var query = function(s) {
        return s[collection].remove(id);
      };

      return dbRun(serverPromise, query);
    };

    //
    // Project API
    //
    var getProject = function(id) {
      return getObject(selectGlobal(), 'project', id);
    };

    var getAllProjects = function() {
      return getAllObjects(selectGlobal(), 'project');
    };

    var updateProject = function(obj) {
      return updateObject(selectGlobal(), 'project', obj);
    };

    var removeProject = function(id) {
      return removeObject(selectGlobal(), 'project', id);
    };

    //
    // Preference API
    //
    var getPreference = function(id) {
      return getObject(selectGlobal(), 'preference', id);
    };

    var getAllPreferences = function() {
      return getAllObjects(selectGlobal(), 'preference');
    };

    var updatePreference = function(obj) {
      return updateObject(selectGlobal(), 'preference', obj);
    };

    var removePreference = function(id) {
      return removeObject(selectGlobal(), 'preference', id);
    };

    //
    // Settings API
    //
    var getSetting = function(project, id) {
      return getObject(selectProject(project.dbname), 'setting', id);
    };

    var getAllSettings = function(project) {
      return getAllObjects(selectProject(project.dbname), 'setting');
    };

    var updateSetting = function(project, obj) {
      return updateObject(selectProject(project.dbname), 'setting', obj);
    };

    var removeSetting = function(project, id) {
      return removeObject(selectProject(project.dbname), 'setting', id);
    };

    //
    // Card API
    //
    var getCard = function(project, id) {
      return getObject(selectProject(project.dbname), 'card', id);
    };

    var getAllCards = function(project) {
      return getAllObjects(selectProject(project.dbname), 'card');
    };

    var updateCard = function(project, obj) {
      $log.info('project: ' + JSON.stringify(project));
      $log.info('obj: ' + JSON.stringify(obj));
      return updateObject(selectProject(project.dbname), 'card', obj);
    };

    var removeCard = function(project, id) {
      return removeObject(selectProject(project.dbname), 'card', id);
    };

    return {
      getProject: getProject,
      getAllProjects: getAllProjects,
      updateProject: updateProject,
      removeProject: removeProject,
      getPreference: getPreference,
      getAllPreferences: getAllPreferences,
      updatePreference: updatePreference,
      removePreference: removePreference,
      getSetting: getSetting,
      getAllSettings: getAllSettings,
      updateSetting: updateSetting,
      removeSetting: removeSetting,
      getCard: getCard,
      getAllCards: getAllCards,
      updateCard: updateCard,
      removeCard: removeCard
    };
  }
]);
