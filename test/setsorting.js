import PageableCollection from "../src/backbone.paginator";

QUnit.module("Backbone.PageableCollection - setSorting");

QUnit.test("constructor", function (assert) {
  var comparator = function () {return 0;};
  var Col = PageableCollection.extend({
    comparator: function () {return 1;}
  });
  var col = new Col([], {
    mode: "client",
    comparator: comparator,
    full: true
  });

  assert.ok(col.fullCollection.comparator === comparator);
  assert.ok(!col.comparator);
});

QUnit.test("_makeComparator", function (assert) {
  var col, comparator;

  col = new PageableCollection();
  comparator = col._makeComparator();
  assert.strictEqual(comparator, undefined);

  col.state.sortKey = "name";
  col.state.order = 0;
  comparator = col._makeComparator();
  assert.strictEqual(comparator, undefined);

  col.reset([{name: "b"}, {name: "c"}, {name: "A"}, {name: "a"}]);
  col.state.order = -1;
  col.comparator = col._makeComparator();
  col.sort();
  assert.deepEqual(col.pluck("name"), ["A", "a", "b", "c"]);

  col.state.order = 1;
  col.comparator = col._makeComparator();
  col.sort();
  assert.deepEqual(col.pluck("name"), ["c", "b", "a", "A"]);

  delete col.state.sortKey;
  delete col.state.order;
  col.comparator = col._makeComparator("name", -1);
  col.sort();
  assert.deepEqual(col.pluck("name"), ["A", "a", "b", "c"]);

  delete col.state.sortKey;
  delete col.state.order;
  delete col.comparator;
  col.comparator = col._makeComparator("name", 1, function (model, attr) {
    return model.get(attr).toLowerCase();
  });
  col.sort();
  assert.deepEqual(col.pluck("name"), ["c", "b", "A", "a"]);
});

QUnit.test("setSorting", function (assert) {

  var col = new (PageableCollection.extend({
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
  assert.strictEqual(col.state.sortKey, "id");
  assert.strictEqual(col.state.order, -1);
  assert.ok(!col.state.comparator);
  assert.deepEqual(col.toJSON(), [{id: 2}, {id: 1}, {id: 3}]);

  col.setSorting("id", 1);
  assert.strictEqual(col.state.sortKey, "id");
  assert.strictEqual(col.state.order, 1);
  assert.ok(!col.state.comparator);
  assert.deepEqual(col.toJSON(), [{id: 2}, {id: 1}, {id: 3}]);

  col.setSorting("id", -1, {full: false});
  col.sort();
  assert.deepEqual(col.toJSON(), [{id: 1}, {id: 2}, {id: 3}]);

  col = new PageableCollection([
    {id: 2},
    {id: 1},
    {id: 3}
  ], {
    pageSize: 3,
    mode: "client"
  });

  col.setSorting("id", -1, {full: false});
  col.sort();
  assert.deepEqual(col.toJSON(), [{id: 1}, {id: 2}, {id: 3}]);
  assert.ok(!col.fullCollection.comparator);

  col.setSorting(null);
  assert.ok(!col.comparator);

  col.setSorting("id");
  col.fullCollection.sort();
  assert.deepEqual(col.fullCollection.toJSON(), [{id: 1}, {id: 2}, {id: 3}]);
  assert.ok(!col.comparator);

  col.setSorting("id", 1);
  col.fullCollection.sort();
  assert.deepEqual(col.fullCollection.toJSON(), [{id: 3}, {id: 2}, {id: 1}]);
  assert.ok(!col.comparator);

  col.setSorting(null);
  assert.ok(!col.comparator);
  assert.ok(!col.fullCollection.comparator);

  col.setSorting("id", -1, {full: false, sortValue: function (model, sortKey) {
    return model.get(sortKey) / 3;
  }});
  col.sort();
  assert.deepEqual(col.toJSON(), [{id: 1}, {id: 2}, {id: 3}]);
  assert.ok(!col.fullCollection.comparator);
});

QUnit.test("Issue #253 Make sure the sorted result on the full collection is reflected on the current page", function (assert) {
  var col = new PageableCollection(
      [
        {"volume": 8},
        {"volume": 6},
        {"volume": 6},
        {"volume": 3},
        {"volume": 2},
        {"volume": 2},
        {"volume": 2},
        {"volume": 1},
        {"volume": 1},
        {"volume": 1},

        {"volume": 112},
        {"volume": 38},
        {"volume": 24},
        {"volume": 22},
        {"volume": 19},
        {"volume": 13},
        {"volume": 13},
        {"volume": 10},
        {"volume": 9},
        {"volume": 9},

        {"volume": 1},
        {"volume": 1},
        {"volume": 1},
        {"volume": 1},
        {"volume": 1},
        {"volume": 1}
      ], {
        state: {
          pageSize: 10
        },
        mode: "client"
      });
  col.setSorting("volume", 1, {full: true});
  col.fullCollection.sort();
  assert.deepEqual(col.getFirstPage().pluck("volume"), [112, 38, 24, 22, 19, 13, 13, 10, 9, 9]);
  assert.deepEqual(col.getNextPage().pluck("volume"), [8, 6, 6, 3, 2, 2, 2, 1, 1, 1]);
  assert.deepEqual(col.getNextPage().pluck("volume"), [1, 1, 1, 1, 1, 1]);
  assert.deepEqual(col.fullCollection.pluck("volume"), [112, 38, 24, 22, 19, 13, 13, 10, 9, 9, 8, 6, 6, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
});
