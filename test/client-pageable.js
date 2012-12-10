$(document).ready(function () {

  module("Backbone.PageableCollection - Client");

  test("_makeFullCollection", function () {
    var sync = function () {};
    var comparator = function () {};
    var col = new (Backbone.PageableCollection.extend({
      url: "test/makeFullCollection",
      model: Backbone.Model,
      sync: sync
    }))();

    var fullCol = col._makeFullCollection([
      {"name": "a"},
      {"name": "c"},
      {"name": "b"}
    ], { comparator: comparator });

    ok(!_.isUndefined(fullCol));
    strictEqual(fullCol.comparator, comparator);
    strictEqual(fullCol.sync, sync);
    strictEqual(fullCol.model, Backbone.Model);
    strictEqual(fullCol.url, "test/makeFullCollection");
    strictEqual(fullCol.at(0).get("name"), "a");
    strictEqual(fullCol.at(1).get("name"), "c");
    strictEqual(fullCol.at(2).get("name"), "b");

    var a = new Backbone.Model({"name": "a"}, {collection: 1});
    var c = new Backbone.Model({"name": "c"}, {collection: 1});
    var b = new Backbone.Model({"name": "b"}, {collection: 1});

    fullCol = col._makeFullCollection([
      a, c, b
    ]);

    strictEqual(fullCol.at(0).get("name"), "a");
    strictEqual(fullCol.at(1).get("name"), "c");
    strictEqual(fullCol.at(2).get("name"), "b");

    strictEqual(fullCol.at(0).collection, fullCol);
    strictEqual(fullCol.at(1).collection, fullCol);
    strictEqual(fullCol.at(2).collection, fullCol);
  });

  test("initialize", function () {
  });

  test("add", function () {
  });

  test("remove", function () {
  });

  test("change", function () {
  });

  test("reset", function () {
  });

  test("sync", function () {
  });

  test("fetch", function () {
  });

  test("getPage", function () {
  });

  test("getFirstPage", function () {
  });

  test("getPreviousPage", function () {
  });

  test("getNextPage", function () {
  });

  test("getLastPage", function () {
  });

  test("setPageSize", function () {
  });

});
