$(document).ready(function () {

  var a, c, b, models, comparator;

  module("Backbone.PageableCollection - Client", {

    setup: function () {

      a = new Backbone.Model({"name": "a"});
      c = new Backbone.Model({"name": "c"});
      b = new Backbone.Model({"name": "b"});

      models = [
        {"name": "a"},
        {"name": "c"},
        {"name": "b"}
      ];

      comparator = function (model) {
        return model.get("name");
      };
    }
  });

  test("_makeFullCollection", function () {
    var sync = function () {};

    var col = new (Backbone.PageableCollection.extend({
      url: "test/makeFullCollection",
      model: Backbone.Model,
      sync: sync
    }))();

    var fullCol = col._makeFullCollection(models,
                                          { comparator: comparator });

    ok(!_.isUndefined(fullCol));
    strictEqual(fullCol.comparator, comparator);
    strictEqual(fullCol.sync, sync);
    strictEqual(fullCol.model, Backbone.Model);
    strictEqual(fullCol.url, "test/makeFullCollection");
    strictEqual(fullCol.at(0).get("name"), "a");
    strictEqual(fullCol.at(1).get("name"), "b");
    strictEqual(fullCol.at(2).get("name"), "c");

    a.collection = 1;
    c.collection = 1;
    b.collection = 1;

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

    var mods = models.slice();

    var col = new Backbone.PageableCollection(mods, {
      comparator: comparator,
      state: {
        pageSize: 1,
        isClientMode: true
      }
    });

    strictEqual(col.state.totalRecords, 3);
    strictEqual(col.comparator, comparator);
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.fullCollection.size(), 3);
    strictEqual(col.at(0), col.fullCollection.at(0));
    strictEqual(col.fullCollection.at(0).get("name"), "a");
    strictEqual(col.fullCollection.at(1).get("name"), "c");
    strictEqual(col.fullCollection.at(2).get("name"), "b");

    mods = models.slice();

    col = new Backbone.PageableCollection(mods, {
      state: {
        pageSize: 1,
        sortKey: "name",
        isClientMode: true
      },
      full: true
    });

    strictEqual(col.state.totalRecords, 3);
    ok(!_.isUndefined(col.fullCollection.comparator));
    ok(_.isUndefined(col.comparator));

    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.fullCollection.size(), 3);
    strictEqual(col.fullCollection.at(0).get("name"), "a");
    strictEqual(col.fullCollection.at(1).get("name"), "b");
    strictEqual(col.fullCollection.at(2).get("name"), "c");
  });

  test("add", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        isClientMode: true,
        pageSize: 3
      }
    });

    var d = new Backbone.Model({name: "d"});
    col.add(d);

    var nextPageStart = (col.state.firstPage === 1 ?
                         col.state.currentPage - 1 :
                         col.state.currentPage) * col.state.pageSize + col.state.pageSize;
    strictEqual(col.fullCollection.at(nextPageStart).get("name"), "d");
    strictEqual(col.size(), 3);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");
    strictEqual(col.at(2).get("name"), "b");

    var e = new Backbone.Model({name: "e"});
    col.fullCollection.push(e);
    strictEqual(col.size(), 3);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");
    strictEqual(col.at(2).get("name"), "b");
    strictEqual(col.indexOf(e.cid), -1);

    var f = new Backbone.Model({name: "f"});
    col.fullCollection.unshift(f);
    strictEqual(col.fullCollection.size(), 6);
    strictEqual(col.size(), 3);
    strictEqual(col.at(0).get("name"), "f");
    strictEqual(col.at(1).get("name"), "a");
    strictEqual(col.at(2).get("name"), "c");
  });

  test("remove", 11, function () {

    var mods = models.slice();

    var col = new Backbone.PageableCollection(mods, {
      state: {
        isClientMode: true,
        pageSize: 1
      }
    });

    strictEqual(col.size(), 1);
    col.remove(col.at(0));
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "c");
    strictEqual(col.fullCollection.size(), 2);
    strictEqual(col.fullCollection.at(0).get("name"), "c");
    strictEqual(col.fullCollection.at(1).get("name"), "b");

    var onRemove = function () {
      ok(false);
    };

    col.fullCollection.remove(col.fullCollection.at(1));
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "c");
    strictEqual(col.fullCollection.size(), 1);

    col.fullCollection.remove(col.fullCollection.at(0));
    strictEqual(col.size(), 0);
    strictEqual(col.fullCollection.size(), 0);
  });

  test("change", 6, function () {
    // a change of a model attribute from current should propagate to full
    // a change of a model attribute from full not in the current page should not
    // propagate to current page
    // a change of model attribute from full in current page should propagate to
    // current page
    var col = new Backbone.PageableCollection(models, {
      state: {
        isClientMode: true,
        pageSize: 1
      }
    });

    var onChange = function (model, options) {
      ok(true);
    };
    col.on("change", onChange);
    col.fullCollection.on("change", onChange);
    col.at(0).set("name", "e");
    strictEqual(col.fullCollection.at(0).get("name"), "e");
    col.fullCollection.at(1).set("name", "f");
    col.fullCollection.at(0).set("name", "g");
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
