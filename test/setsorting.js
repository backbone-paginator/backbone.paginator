$(document).ready(function () {

  "use strict";

  module("Backbone.PageableCollection - setSorting");

  test("constructor", function () {
    var comparator = function () { return 0; };
    var Col = Backbone.PageableCollection.extend({
      comparator: function () { return 1; }
    });
    var col = new Col([], {
      mode: "client",
      comparator: comparator,
      full: true
    });

    ok(col.fullCollection.comparator === comparator);
    ok(!col.comparator);
  });

  test("_makeComparator", function () {
    var col, comparator;

    col = new Backbone.PageableCollection();
    comparator = col._makeComparator();
    strictEqual(comparator, undefined);

    col.state.sortKey = "name";
    col.state.order = 0;
    comparator = col._makeComparator();
    strictEqual(comparator, undefined);

    col.reset([{name: "b"}, {name: "c"}, {name: "A"}, {name: "a"}]);
    col.state.order = -1;
    col.comparator = col._makeComparator();
    col.sort();
    deepEqual(col.pluck("name"), ["A", "a", "b", "c"]);

    col.state.order = 1;
    col.comparator = col._makeComparator();
    col.sort();
    deepEqual(col.pluck("name"), ["c", "b", "a", "A"]);

    delete col.state.sortKey;
    delete col.state.order;
    col.comparator = col._makeComparator("name", -1);
    col.sort();
    deepEqual(col.pluck("name"), ["A", "a", "b", "c"]);

    delete col.state.sortKey;
    delete col.state.order;
    delete col.comparator;
    col.comparator = col._makeComparator("name", 1, function (model, attr) {
      return model.get(attr).toLowerCase();
    });
    col.sort();
    deepEqual(col.pluck("name"), ["c", "b", "A", "a"]);
  });

  test("setSorting", function () {

    var col = new (Backbone.PageableCollection.extend({
      comparator: function (l, r) {
        return 0;
      }
    }))([
      {id: 2},
      {id: 1},
      {id: 3}
    ], {
      pageSize: 3
    });

    col.setSorting("id");
    strictEqual(col.state.sortKey, "id");
    strictEqual(col.state.order, -1);
    ok(!col.state.comparator);
    deepEqual(col.toJSON(), [{id: 2}, {id: 1}, {id: 3}]);

    col.setSorting("id", 1);
    strictEqual(col.state.sortKey, "id");
    strictEqual(col.state.order, 1);
    ok(!col.state.comparator);
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
    ok(!col.fullCollection.comparator);

    col.setSorting(null);
    ok(!col.comparator);

    col.setSorting("id");
    col.fullCollection.sort();
    deepEqual(col.fullCollection.toJSON(), [{id: 1}, {id: 2}, {id: 3}]);
    ok(!col.comparator);

    col.setSorting("id", 1);
    col.fullCollection.sort();
    deepEqual(col.fullCollection.toJSON(), [{id: 3}, {id: 2}, {id: 1}]);
    ok(!col.comparator);

    col.setSorting(null);
    ok(!col.comparator);
    ok(!col.fullCollection.comparator);

    col.setSorting("id", -1, {full: false, sortValue: function (model, sortKey) {
      return model.get(sortKey) / 3;
    }});
    col.sort();
    deepEqual(col.toJSON(), [{id: 1}, {id: 2}, {id: 3}]);
    ok(!col.fullCollection.comparator);
  });

});
