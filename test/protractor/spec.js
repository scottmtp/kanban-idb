// spec.js
describe('Kanban IDB', function() {
  beforeEach(function() {
    browser.get('http://localhost:9000/#/kanban');
  });

  it('should have a title', function() {
    expect(browser.getTitle()).toEqual('Kanban IDB');
  });

  it('should have a Board tab', function() {
    expect(element(by.id('boardTab')).getText()).toEqual('Board');
  });
});
