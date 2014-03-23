'use strict';

angular.module('kanbanApp').service('kanbanService', ['dbService', function(dbService) {
  
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
    getCards: getCards,
    saveCard: saveCard,
    deleteCard: deleteCard
  };
  
}]);
