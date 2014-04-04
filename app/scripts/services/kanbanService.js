/*global _ */
'use strict';

angular.module('kanbanApp').service('kanbanService', ['uuid4', 'dbService', function(uuid4, dbService) {
  var getCardTemplate = function(initialStatus) {
    var templateTask = getTaskTemplate();
    var templateCard = {
      'id': uuid4.generate(),
      'ordinal': 0,
      'status': initialStatus,
      'points': 0,
      'tasks': [], 'newTask': templateTask};
    return templateCard;
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
  
  var deleteCard = function(project, card) {
    return dbService.removeCard(project, card.id);
  };
  
  return {
    getCardTemplate: getCardTemplate,
    getTaskTemplate: getTaskTemplate,
    getCards: getCards,
    saveCard: saveCard,
    deleteCard: deleteCard
  };
  
}]);
