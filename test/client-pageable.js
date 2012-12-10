$(document).ready(function () {

  module("Backbone.PageableCollection - Client");

  test("_makeFullCollection", function () {
    var col = new Backbone.PageableCollection();
    var fullCol = col._makeFullCollection();
    // test a bb col is created
    // test new bb col is created with the options supplied
    // test new bb col has model, url and sync from parent col
    // test new bb col has event handler connected
    // test models are created from attribute hashes
    // test bb models have original collection removed
  });

});
