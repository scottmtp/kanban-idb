'use strict';

angular.module('kanbanApp').service('kanbanService', ['uuid4', 'dbService', function(uuid4, dbService) {
  var getCardTemplate = function(initialStatus) {
    var templateTask = getTaskTemplate();
    var templateCard = {
      '_id': uuid4.generate(),
      'ordinal': 0,
      'status': initialStatus,
      'points': 0,
      'tasks': [],
      'newTask': templateTask
    };

    return templateCard;
  };

  var setStatusAndOrdinal = function(project, cardList, status) {
    for (var i = 0; i < cardList.length; i++) {
      cardList[i].ordinal = i;
      cardList[i].status = status;
    }
  };

  var getTaskTemplate = function() {
    return {'name': '', 'status': 'Open'};
  };

  var getCards = function(project) {
    return dbService.getAllCards(project);
  };

  var saveCard = function(project, card) {
    return dbService.updateCard(project, card);
  };

  var saveCards = function(project, cardList) {
    var promises = [];
    for (var i = 0; i < cardList.length; i++) {
      promises.push(saveCard(project, cardList[i]));
    }
    return promises;
  };

  var deleteCard = function(project, card) {
    return dbService.removeCard(project, card._id);
  };

  var replicate = function(project) {
    return dbService.join(project)
      .then(function() {
        return dbService.replicate(project)
      });
  };

  return {
    getCardTemplate: getCardTemplate,
    getTaskTemplate: getTaskTemplate,
    getCards: getCards,
    saveCard: saveCard,
    saveCards: saveCards,
    deleteCard: deleteCard,
    setStatusAndOrdinal: setStatusAndOrdinal,
    replicate: replicate
  };

}]);
