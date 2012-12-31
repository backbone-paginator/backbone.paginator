$(document).ready(function () {

  "use strict";

  module("Backbone.PageableCollection.noConflict");

  test('noConflict', 2, function () {
    var noconflictBackbonePageableCollection = Backbone.PageableCollection.noConflict();
    equal(window.Backbone.PageableCollection, undefined, 'Returned window.Backbone.PageableCollection');
    window.Backbone.PageableCollection = noconflictBackbonePageableCollection;
    equal(window.Backbone.PageableCollection, noconflictBackbonePageableCollection, 'Backbone.PageableCollection is still pointing to the original Backbone.PageableCollection');
  });

});
