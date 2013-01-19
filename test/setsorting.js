$(document).ready(function () {

  "use strict";

  module("Backbone.PageableCollection - setSorting");

  test("_makeComparator", function () {
    var col, comparator;

    col = new Backbone.PageableCollection();
    comparator = col._makeComparator();
    strictEqual(comparator, undefined);

    col.state.sortKey = "name";
    col.state.order = 0;
    comparator = col._makeComparator();
    strictEqual(comparator, undefined);

    col = col.reset([{name: "b"}, {name: "c"}, {name: "a"}, {name: "a"}]);
    col.state.order = -1;
    col.comparator = col._makeComparator();
    col.sort();
    deepEqual(col.pluck("name"), ["a", "a", "b", "c"]);

    col.state.order = 1;
    col.comparator = col._makeComparator();
    col.sort();
    deepEqual(col.pluck("name"), ["c", "b", "a", "a"]);

    delete col.state.sortKey;
    delete col.state.order;
    col.comparator = col._makeComparator("name", -1);
    col.sort();
    deepEqual(col.pluck("name"), ["a", "a", "b", "c"]);
  });

  test("setSorting", function () {

    var col = new Backbone.PageableCollection([
      {id: 2},
      {id: 1},
      {id: 3}
    ], {
      pageSize: 3
    });

    col.setSorting("id");
    strictEqual(col.state.sortKey, "id");
    strictEqual(col.state.order, -1);
    ok(_.isUndefined(col.state.comparator));
    deepEqual(col.toJSON(), [{id: 2}, {id: 1}, {id: 3}]);

    col.setSorting("id", 1);
    strictEqual(col.state.sortKey, "id");
    strictEqual(col.state.order, 1);
    ok(_.isUndefined(col.state.comparator));
    deepEqual(col.toJSON(), [{id: 2}, {id: 1}, {id: 3}]);

    col.setSorting("id", -1, {full: false});
    col.sort();
    deepEqual(col.toJSON(), [{id: 1}, {id: 2}, {id: 3}]);

    col = new Backbone.PageableCollection([
      {id: 2},
      {id: 1},
      {id: 3}
    ], {
      pageSize: 3,
      mode: "client"
    });

    col.setSorting("id", -1, {full: false});
    col.sort();
    deepEqual(col.toJSON(), [{id: 1}, {id: 2}, {id: 3}]);
    ok(_.isUndefined(col.fullCollection.comparator));

    col.setSorting(null);
    ok(_.isUndefined(col.comparator));

    col.setSorting("id");
    col.fullCollection.sort();
    deepEqual(col.fullCollection.toJSON(), [{id: 1}, {id: 2}, {id: 3}]);
    ok(_.isUndefined(col.comparator));

    col.setSorting("id", 1);
    col.fullCollection.sort();
    deepEqual(col.fullCollection.toJSON(), [{id: 3}, {id: 2}, {id: 1}]);
    ok(_.isUndefined(col.comparator));

    col.setSorting(null);
    ok(_.isUndefined(col.comparator));
    ok(_.isUndefined(col.fullCollection.comparator));
  });

});
