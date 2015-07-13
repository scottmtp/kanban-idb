'use strict';

angular.module('kanbanApp').service('replicatorService', ['$log', '$q', '$rootScope',
  function replicatorService($log, $q, $rootScope) {
    var pouchDB = require('pouchdb');
    var PouchReplicator = require('pouch-replicate-webrtc');
    var replicator;

    //
    // Replication API
    //
    var join = function(project, receive) {
      $log.debug('starting join: ' + JSON.stringify(project));
      var replDb = pouchDB(project.dbname);
      var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb29tcyI6WyJwbHV0byI'
        + 'sInZlbnVzIiwianVwaXRlciJdfQ.uMMkNdDdIXolau6UrDlmLT2e7JkMumJze2vvBNnNTX0';
        
      replicator = new PouchReplicator('repl', project.signaller, {room: project.room, endpoints: ['/ws?token=' + token]}, replDb, {batch_size: 1});
      replicator.on('endpeerreplicate', receive);

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
