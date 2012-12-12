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
        pageSize: 2,
        isClientMode: true
      }
    });

    strictEqual(col.state.totalRecords, 3);
    strictEqual(col.comparator, comparator);
    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");
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

  test("add", 20, function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        isClientMode: true,
        pageSize: 3
      }
    });

    var onAdd = function () {
      ok(true);
    };
    col.fullCollection.on("add", onAdd);
    col.on("add", onAdd);

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

  test("remove", 15, function () {

    var mods = models.slice();

    var col = new Backbone.PageableCollection(mods, {
      state: {
        isClientMode: true,
        pageSize: 1
      }
    });

    var onRemove = function () {
      ok(true);
    };
    col.on("remove", onRemove);
    col.fullCollection.on("remove", onRemove);

    col.remove(col.at(0));
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "c");
    strictEqual(col.fullCollection.size(), 2);
    strictEqual(col.fullCollection.at(0).get("name"), "c");
    strictEqual(col.fullCollection.at(1).get("name"), "b");

    col.fullCollection.remove(col.fullCollection.at(1));
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "c");
    strictEqual(col.fullCollection.size(), 1);

    col.fullCollection.remove(col.fullCollection.at(0));
    strictEqual(col.size(), 0);
    strictEqual(col.fullCollection.size(), 0);
  });

  test("change", 6, function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        isClientMode: true,
        pageSize: 1
      }
    });

    var onChange = function () {
      ok(true);
    };
    col.on("change", onChange);
    col.fullCollection.on("change", onChange);
    col.at(0).set("name", "e");
    strictEqual(col.fullCollection.at(0).get("name"), "e");
    col.fullCollection.at(1).set("name", "f");
    col.fullCollection.at(0).set("name", "g");
  });

  test("sync", 5, function () {
    var ajax = jQuery.ajax;
    jQuery.ajax = function (settings) {
      settings.success();
    };

    var col = new (Backbone.PageableCollection.extend({
      url: "test-client-sync"
    }))(models, {
      state: {
        isClientMode: true,
        pageSize: 1
      }
    });

    var onSync = function () {
      ok(true);
    };

    col.on("sync", onSync);
    col.fullCollection.on("sync", onSync);

    col.at(0).save();
    col.fullCollection.at(0).save();
    col.fullCollection.at(1).save();

    jQuery.ajax = ajax;
  });

  test("reset and sort", function () {
    if (Backbone.VERSION == "0.9.2") {
      expect(37);
    }
    else {
      expect(33);
    }

    var mods = models.slice();

    var col = new Backbone.PageableCollection(mods, {
      state: {
        isClientMode: true,
        pageSize: 2
      }
    });

    var onReset = function () {
      ok(true);
    };

    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);

    col.fullCollection.reset([
      {name: "e"},
      {name: "f"},
      {name: "d"}
    ]);

    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "e");
    strictEqual(col.at(1).get("name"), "f");

    col.fullCollection.comparator = comparator;
    col.fullCollection.sort();

    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "d");
    strictEqual(col.at(1).get("name"), "e");

    mods = models.slice();

    col = new Backbone.PageableCollection(mods, {
      state: {
        isClientMode: true,
        pageSize: 2
      }
    });

    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);

    col.comparator = comparator;
    col.sort();

    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");

    strictEqual(col.fullCollection.at(0).get("name"), "a");
    strictEqual(col.fullCollection.at(1).get("name"), "c");
    strictEqual(col.fullCollection.at(2).get("name"), "b");

    col.comparator = null;

    mods = [new Backbone.Model({name: "g"}), col.at(0)];
    col.reset(mods);
    strictEqual(col.at(0).get("name"), "g");
    strictEqual(col.at(1).get("name"), "a");
    strictEqual(col.fullCollection.at(0).get("name"), "g");
    strictEqual(col.fullCollection.at(1).get("name"), "a");
    strictEqual(col.fullCollection.at(2).get("name"), "b");

    col.fullCollection.reset([
      {name: "j"},
      {name: "h"},
      {name: "i"},
      {name: "k"}
    ]);

    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "j");
    strictEqual(col.at(1).get("name"), "h");
    strictEqual(col.fullCollection.at(0).get("name"), "j");
    strictEqual(col.fullCollection.at(1).get("name"), "h");
    strictEqual(col.fullCollection.at(2).get("name"), "i");
    strictEqual(col.fullCollection.at(3).get("name"), "k");
    strictEqual(col.state.totalRecords, 4);
    strictEqual(col.state.lastPage, 2);
    strictEqual(col.state.totalPages, 2);
  });

  test("fetch", function () {

    if (Backbone.VERSION === "0.9.2") expect(11);
    else expect(10);

    var ajax = jQuery.ajax;
    jQuery.ajax = function (settings) {

      strictEqual(settings.url, "test-client-fetch");
      deepEqual(settings.data, {
        "sort_by": "name",
        "order": "DESC"
      });

      settings.success([
        {name: "a"},
        {name: "c"},
        {name: "d"},
        {name: "b"}
      ]);
    };

    var col = new (Backbone.PageableCollection.extend({
      url: "test-client-fetch"
    }))(models, {
      state: {
        isClientMode: true,
        pageSize: 2,
        sortKey: "name",
        order: 1
      }
    });

    var onReset = function () {
      ok(true);
    };

    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);

    col.fetch();

    strictEqual(col.at(0).get("name"), "d");
    strictEqual(col.at(1).get("name"), "c");
    strictEqual(col.fullCollection.at(0).get("name"), "d");
    strictEqual(col.fullCollection.at(1).get("name"), "c");
    strictEqual(col.fullCollection.at(2).get("name"), "b");
    strictEqual(col.fullCollection.at(3).get("name"), "a");

    jQuery.ajax = ajax;
  });

  test("getPage", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        isClientMode: true,
        pageSize: 2
      }
    });

    col.getPage(2);
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "b");

    this.stub(col, "fetch");

    col.getPage(1, {fetch: true});
    ok(col.fetch.calledOnce);
  });

  test("getFirstPage", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        isClientMode: true,
        pageSize: 2
      }
    });

    col.getFirstPage();
    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");

    this.stub(col, "fetch");

    col.getFirstPage({fetch: true});
    ok(col.fetch.calledOnce);    
  });

  test("getPreviousPage", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        isClientMode: true,
        pageSize: 2
      }
    });

    col.getNextPage();
    col.getPreviousPage();
    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");

    this.stub(col, "fetch");

    col.getNextPage();
    col.getPreviousPage({fetch: true});
    ok(col.fetch.calledOnce);    
  });

  test("getNextPage", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        isClientMode: true,
        pageSize: 2
      }
    });

    col.getNextPage();
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "b");

    this.stub(col, "fetch");

    col.getPreviousPage();
    col.getNextPage({fetch: true});
    ok(col.fetch.calledOnce);    
  });

  test("getLastPage", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        isClientMode: true,
        pageSize: 2
      }
    });

    col.getLastPage();
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "b");

    this.stub(col, "fetch");

    col.getLastPage({fetch: true});
    ok(col.fetch.calledOnce);    
  });

  test("setPageSize", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        isClientMode: true,
        pageSize: 2
      }
    });

    col.setPageSize(1);
    
    strictEqual(col.state.pageSize, 1);
    strictEqual(col.state.totalPages, 3);
    strictEqual(col.state.lastPage, 3);
  });

});
