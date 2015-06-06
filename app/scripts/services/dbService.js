/*global _ */
'use strict';

angular.module('kanbanApp').service('dbService', ['$log', '$q', '$rootScope', 'pouchDB',
  function dbService($log, $q, $rootScope, pouchDB) {
    var db;

    // Use the global database
    var selectGlobal = function() {
      $log.info('Switching to global database.');
      db = pouchDB('kanban_global');
    };

    // Use a project database
    var selectProject = function(dbName) {
      $log.info('selectProject db: ' + dbName);
      db = pouchDB(dbName);
    };

    //
    // Generic API
    //

    // Find one object
    var getObject = function(collection, id) {
      $log.debug('getObject: ' + collection + ', ' + id);
      return db.get(id)
        .catch(function(err) {
          if (err.status !== 404) {
            throw(err);
          }
        });
    };

    // Get all objects
    var getAllObjects = function(collection) {
      $log.debug('getAllObjects: ' + collection);

      return db.allDocs({
        include_docs: true,
        attachments: true
      }).then(function (result) {
        $log.debug('getAllObjects results: ' + JSON.stringify(result));
        var docs = _.chain(result.rows)
          .pluck('doc')
          .filter(function(n) {
            return n.type === collection;
          })
          .value();

        $log.debug('getAllObjects filtered: ' + JSON.stringify(docs));
        return docs;
      });
    };

    // Update or insert object
    var updateObject = function(collection, obj) {
      $log.debug('updateObject: ' + collection + ', ' + JSON.stringify(obj));
      obj.type = collection;
      return db.put(obj);
    };

    // Delete object
    var removeObject = function(collection, id) {
      $log.debug('removeObject: ' + collection + ', ' + id);
      return db.remove(id);
    };

    //
    // Project API
    //
    var getProject = function(id) {
      selectGlobal();
      return getObject('project', id);
    };

    var getAllProjects = function() {
      selectGlobal();
      return getAllObjects('project');
    };

    var updateProject = function(obj) {
      selectGlobal();
      return updateObject('project', obj);
    };

    var removeProject = function(id) {
      selectGlobal();
      return removeObject('project', id);
    };

    //
    // Preference API
    //
    var getPreference = function(id) {
      selectGlobal();
      return getObject('preference', id);
    };

    var getAllPreferences = function() {
      selectGlobal();
      return getAllObjects('preference');
    };

    var updatePreference = function(obj) {
      selectGlobal();
      return updateObject('preference', obj);
    };

    var removePreference = function(id) {
      selectGlobal();
      return removeObject('preference', id);
    };

    //
    // Settings API
    //
    var getSetting = function(project, id) {
      selectProject(project.dbname);
      return getObject('setting', id);
    };

    var getAllSettings = function(project) {
      selectProject(project.dbname);
      return getAllObjects('setting');
    };

    var updateSetting = function(project, obj) {
      selectProject(project.dbname);
      return updateObject('setting', obj);
    };

    var removeSetting = function(project, id) {
      selectProject(project.dbname);
      return removeObject('setting', id);
    };

    //
    // Card API
    //
    var getCard = function(project, id) {
      selectProject(project.dbname);
      return getObject('card', id);
    };

    var getAllCards = function(project) {
      selectProject(project.dbname);
      return getAllObjects('card');
    };

    var updateCard = function(project, obj) {
      selectProject(project.dbname);
      return updateObject('card', obj);
    };

    var removeCard = function(project, id) {
      selectProject(project.dbname);
      return removeObject('card', id);
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
