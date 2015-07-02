'use strict';

angular.module('kanbanApp').service('replicatorService', ['$log', '$q', '$rootScope', 'pouchDB',
  function replicatorService($log, $q, $rootScope, pouchDB) {
    var PouchReplicator = require('pouch-replicate-webrtc');
    var replicator;

    //
    // Replication API
    //
    var join = function(project, receive) {
      $log.debug('starting join: ' + JSON.stringify(project));
      var replDb = pouchDB(project.dbname);
      replicator = new PouchReplicator('repl', project.signaller, {room: project.room}, replDb, {batch_size: 1});
      replicator.on('load', receive);
      
      return replicator.join();
    };

    var replicate = function(project) {
      $log.debug('starting replicate: ' + JSON.stringify(project));
      return replicator.replicate();
    };

    var connectedPeers = function() {
      if (replicator) {
        return replicator.getPeers().length;
      }

      return 0;
    };

    return {
      join: join,
      replicate: replicate,
      connectedPeers: connectedPeers
    };
  }
]);
