'use strict';

angular.module('kanbanApp').service('projectService', ['uuid4', 'dbService', function(uuid4, dbService) {

  var getProjectTemplate = function() {
    var projectId = uuid4.generate();

    var template = {
      '_id': projectId,
      'name': 'My Project',
      'dbname': 'kb_' + projectId
    };

    return template;
  };

  var getAllProjects = function() {
    return dbService.getAllProjects();
  };

  var getProject = function(id) {
    return dbService.getProject(id);
  };

  var saveProject = function(project) {
    return dbService.updateProject(project);
  };

  return {
    getProjectTemplate: getProjectTemplate,
    getAllProjects: getAllProjects,
    getProject: getProject,
    saveProject: saveProject
  };
}]);
