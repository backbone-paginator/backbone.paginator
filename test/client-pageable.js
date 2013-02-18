$(document).ready(function () {

  "use strict";

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
    ok(_.isUndefined(fullCol.constructor.prototype.comparator));
    strictEqual(fullCol.comparator, comparator);
    strictEqual(fullCol.constructor.prototype.sync, sync);
    strictEqual(fullCol.sync, sync);
    strictEqual(fullCol.constructor.prototype.model, Backbone.Model);
    strictEqual(fullCol.model, Backbone.Model);
    strictEqual(fullCol.constructor.prototype.url, "test/makeFullCollection");
    strictEqual(fullCol.url, "test/makeFullCollection");
    strictEqual(fullCol.at(0).get("name"), "a");
    strictEqual(fullCol.at(1).get("name"), "b");
    strictEqual(fullCol.at(2).get("name"), "c");

    a.collection = col;
    c.collection = col;
    b.collection = col;

    fullCol = col._makeFullCollection([
      a, c, b
    ]);

    strictEqual(fullCol.at(0).get("name"), "a");
    strictEqual(fullCol.at(1).get("name"), "c");
    strictEqual(fullCol.at(2).get("name"), "b");

    strictEqual(fullCol.at(0).collection, col);
    strictEqual(fullCol.at(1).collection, col);
    strictEqual(fullCol.at(2).collection, col);
  });

  test("initialize", function () {

    // TODO: test options.full attaches comparator to fullcollection only

    var col = new Backbone.PageableCollection(null, {
      mode: "client"
    });

    ok(col);
    ok(col.fullCollection);

    var mods = models.slice();

    col = new Backbone.PageableCollection(mods, {
      comparator: comparator,
      state: {
        pageSize: 2
      },
      mode: "client"
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
        sortKey: "name"
      },
      full: true,
      mode: "client"
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

  test("add", 49, function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    var lastTotalRecords = col.state.totalRecords;
    var onAdd = function () {
      strictEqual(col.state.totalRecords, lastTotalRecords + 1);
    };
    col.fullCollection.on("add", onAdd);
    col.on("add", onAdd);

    var d = new Backbone.Model({name: "d"});
    col.add(d);
    strictEqual(col.state.totalRecords, 4);
    strictEqual(col.state.totalPages, 2);
    strictEqual(col.fullCollection.size(), 4);
    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");
    strictEqual(col.fullCollection.at(0).get("name"), "a");
    strictEqual(col.fullCollection.at(1).get("name"), "c");
    strictEqual(col.fullCollection.at(2).get("name"), "d");
    strictEqual(col.fullCollection.at(3).get("name"), "b");

    lastTotalRecords = col.state.totalRecords;
    var e = new Backbone.Model({name: "e"});
    col.fullCollection.push(e);
    strictEqual(col.state.totalRecords, 5);
    strictEqual(col.state.totalPages, 3);
    strictEqual(col.fullCollection.size(), 5);
    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");
    strictEqual(col.fullCollection.at(4).get("name"), "e");
    strictEqual(col.indexOf(e.cid), -1);

    lastTotalRecords = col.state.totalRecords;
    var f = new Backbone.Model({name: "f"});
    col.fullCollection.unshift(f);
    strictEqual(col.state.totalRecords, 6);
    strictEqual(col.state.totalPages, 3);
    strictEqual(col.fullCollection.size(), 6);
    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "f");
    strictEqual(col.at(1).get("name"), "a");

    // test add at page col on page 2
    col.getPage(2);
    lastTotalRecords = col.state.totalRecords;
    var g = new Backbone.Model({name: "g"});
    col.add(g, {at: 1});
    strictEqual(col.size(), 2);
    strictEqual(col.fullCollection.size(), 7);
    strictEqual(col.state.totalRecords, 7);
    strictEqual(col.state.totalPages, 4);
    strictEqual(col.state.lastPage, 4);
    strictEqual(col.state.currentPage, 2);
    strictEqual(col.last().get("name"), "g");
    strictEqual(col.fullCollection.at(3).get("name"), "g");

    // test ability to add to empty collection
    col.fullCollection.reset();
    lastTotalRecords = col.state.totalRecords;
    col.add(new Backbone.Model({name: "a"}));

    // test ability to add an array of models
    col.off("add", onAdd);
    col.fullCollection.off("add", onAdd);
    col.fullCollection.reset();
    col.add([{name: "a"}, {name: "c"}, {name: "b"}]);
    strictEqual(col.size(), 2);
    strictEqual(col.fullCollection.size(), 3);
    deepEqual(col.toJSON(), [{name: "a"}, {name: "c"}]);
    deepEqual(col.fullCollection.toJSON(), [{name: "a"}, {name: "c"}, {name: "b"}]);

    col.fullCollection.reset();
    col.fullCollection.add([{name: "a"}, {name: "c"}, {name: "b"}]);
    strictEqual(col.size(), 2);
    strictEqual(col.fullCollection.size(), 3);
    deepEqual(col.toJSON(), [{name: "a"}, {name: "c"}]);
    deepEqual(col.fullCollection.toJSON(), [{name: "a"}, {name: "c"}, {name: "b"}]);
  });

  test("remove", 46, function () {

    var col = new Backbone.PageableCollection([
      {"name": "a"},
      {"name": "c"},
      {"name": "b"},
      {"name": "d"}
    ], {
      state: {
        pageSize: 1
      },
      mode: "client"
    });

    var lastTotalRecords = col.state.totalRecords;
    var lastTotalPages = col.state.totalPages;
    var onRemove = function () {
      ok(true);
      strictEqual(col.state.totalRecords, lastTotalRecords - 1);
      strictEqual(col.state.totalPages, lastTotalPages - 1);
    };
    col.on("remove", onRemove);
    col.fullCollection.on("remove", onRemove);

    col.fullCollection.remove(col.fullCollection.last());
    strictEqual(col.state.totalRecords, 3);
    strictEqual(col.state.totalPages, 3);
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.fullCollection.size(), 3);
    strictEqual(col.fullCollection.at(0).get("name"), "a");
    strictEqual(col.fullCollection.at(1).get("name"), "c");
    strictEqual(col.fullCollection.at(2).get("name"), "b");

    lastTotalRecords = col.state.totalRecords;
    lastTotalPages = col.state.totalPages;
    col.fullCollection.remove(col.fullCollection.first());
    strictEqual(col.state.totalRecords, 2);
    strictEqual(col.state.totalPages, 2);
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "c");
    strictEqual(col.fullCollection.size(), 2);
    strictEqual(col.fullCollection.at(0).get("name"), "c");
    strictEqual(col.fullCollection.at(1).get("name"), "b");

    lastTotalRecords = col.state.totalRecords;
    lastTotalPages = col.state.totalPages;
    col.remove(col.first());
    strictEqual(col.state.totalRecords, 1);
    strictEqual(col.state.totalPages, 1);
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "b");
    strictEqual(col.fullCollection.size(), 1);
    strictEqual(col.fullCollection.at(0).get("name"), "b");

    col.off("remove", onRemove);
    col.fullCollection.off("remove", onRemove);
    onRemove = function () {
      ok(true);
      strictEqual(col.state.totalRecords, null);
      strictEqual(col.state.totalPages, null);
    };
    col.on("remove", onRemove);
    col.fullCollection.on("remove", onRemove);
    col.remove(col.fullCollection.first());

    strictEqual(col.state.totalRecords, null);
    strictEqual(col.state.totalPages, null);
    strictEqual(col.size(), 0);
    strictEqual(col.fullCollection.size(), 0);
  });

  test("add handlers are run before remove handlers", 2, function () {
    var addRan = false;
    var onAdd = function () {
      addRan = true;
    };
    var onRemove = function () {
      strictEqual(addRan, true);
      addRan = false;
    };
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 1
      },
      mode: "client"
    });
    col.on("add", onAdd);
    col.on("remove", onRemove);
    col.unshift(new Backbone.Model({name: "d"}));
    col.fullCollection.unshift(new Backbone.Model({name: "e"}));
  });

  test("change", 6, function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 1
      },
      mode: "client"
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
    var ajax = $.ajax;
    $.ajax = function (settings) {
      settings.success();
    };

    var col = new (Backbone.PageableCollection.extend({
      url: "test-client-sync"
    }))(models, {
      state: {
        pageSize: 1
      },
      mode: "client"
    });

    var onSync = function () {
      ok(true);
    };

    col.on("sync", onSync);
    col.fullCollection.on("sync", onSync);

    col.at(0).save();
    col.fullCollection.at(0).save();
    col.fullCollection.at(1).save();

    $.ajax = ajax;
  });

  test("reset and sort", 76, function () {

    var mods = models.slice();
    var col = new Backbone.PageableCollection(mods, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });
    var onReset = function () {
      ok(true);
      strictEqual(col.state.totalRecords, 4);
      strictEqual(col.state.totalPages, 2);
      strictEqual(col.state.lastPage, 2);
    };
    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);
    col.fullCollection.reset([
      {name: "e"},
      {name: "f"},
      {name: "d"},
      {name: "g"}
    ]);

    strictEqual(col.size(), 2);
    strictEqual(col.fullCollection.size(), 4);
    strictEqual(col.at(0).get("name"), "e");
    strictEqual(col.at(1).get("name"), "f");
    strictEqual(col.fullCollection.at(0).get("name"), "e");
    strictEqual(col.fullCollection.at(1).get("name"), "f");
    strictEqual(col.fullCollection.at(2).get("name"), "d");
    strictEqual(col.fullCollection.at(3).get("name"), "g");

    col.fullCollection.comparator = comparator;
    col.fullCollection.sort();

    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "d");
    strictEqual(col.at(1).get("name"), "e");

    mods = models.slice();
    col = new Backbone.PageableCollection(mods, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });
    onReset = function () {
      ok(true);
      strictEqual(col.state.totalRecords, 3);
      strictEqual(col.state.totalPages, 2);
      strictEqual(col.state.lastPage, 2);
    };
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
    col.off("reset", onReset);
    col.fullCollection.off("reset", onReset);
    onReset = function () {
      ok(true);
      strictEqual(col.state.totalRecords, 3);
      strictEqual(col.state.totalPages, 2);
      strictEqual(col.state.lastPage, 2);
    };
    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);
    mods = [new Backbone.Model({name: "g"}), col.at(0)];
    col.reset(mods);

    strictEqual(col.size(), 2);
    strictEqual(col.fullCollection.size(), 3);
    strictEqual(col.at(0).get("name"), "g");
    strictEqual(col.at(1).get("name"), "a");
    strictEqual(col.fullCollection.at(0).get("name"), "g");
    strictEqual(col.fullCollection.at(1).get("name"), "a");
    strictEqual(col.fullCollection.at(2).get("name"), "b");

    col.off("reset", onReset);
    col.fullCollection.off("reset", onReset);
    onReset = function () {
      ok(true);
      strictEqual(col.state.totalRecords, 4);
      strictEqual(col.state.totalPages, 2);
      strictEqual(col.state.lastPage, 2);
    };
    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);
    col.fullCollection.reset([
      {name: "j"},
      {name: "h"},
      {name: "i"},
      {name: "k"}
    ]);

    strictEqual(col.size(), 2);
    strictEqual(col.fullCollection.size(), 4);
    strictEqual(col.at(0).get("name"), "j");
    strictEqual(col.at(1).get("name"), "h");
    strictEqual(col.fullCollection.at(0).get("name"), "j");
    strictEqual(col.fullCollection.at(1).get("name"), "h");
    strictEqual(col.fullCollection.at(2).get("name"), "i");
    strictEqual(col.fullCollection.at(3).get("name"), "k");
    strictEqual(col.state.totalRecords, 4);
    strictEqual(col.state.lastPage, 2);
    strictEqual(col.state.totalPages, 2);

    col.off("reset", onReset);
    col.fullCollection.off("reset", onReset);
    onReset = function () {
      ok(true);
      ok(col.state.totalRecords === null);
      ok(col.state.totalPages === null);
      ok(col.state.lastPage === col.state.firstPage);
      ok(col.state.currentPage === col.state.firstPage);
      ok(col.length === 0);
      ok(col.fullCollection.length === 0);
    };
    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);

    col.fullCollection.reset();
  });

  test("fetch", 11, function () {

    var ajax = $.ajax;
    $.ajax = function (settings) {

      strictEqual(settings.url, "test-client-fetch");
      deepEqual(settings.data, {
        "sort_by": "name",
        "order": "desc"
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
        pageSize: 2,
        sortKey: "name",
        order: 1
      },
      mode: "client"
    });

    var onReset = function () {
      ok(true);
    };

    var onFullReset = function () {
      ok(true);
    };

    col.on("reset", onReset);
    col.fullCollection.on("reset", onFullReset);

    col.fetch();

    strictEqual(col.at(0).get("name"), "d");
    strictEqual(col.at(1).get("name"), "c");
    strictEqual(col.fullCollection.at(0).get("name"), "d");
    strictEqual(col.fullCollection.at(1).get("name"), "c");
    strictEqual(col.fullCollection.at(2).get("name"), "b");
    strictEqual(col.fullCollection.at(3).get("name"), "a");

    $.ajax = ajax;
  });

  test("getPage", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.getPage(2);
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "b");

    sinon.stub(col, "fetch");

    col.getPage(1, {fetch: true});
    ok(col.fetch.calledOnce);
  });

  test("getFirstPage", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.getFirstPage();
    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");

    sinon.stub(col, "fetch");

    col.getFirstPage({fetch: true});
    ok(col.fetch.calledOnce);
  });

  test("getPreviousPage", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.getNextPage();
    col.getPreviousPage();
    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");

    sinon.stub(col, "fetch");

    col.getNextPage();
    col.getPreviousPage({fetch: true});
    ok(col.fetch.calledOnce);
  });

  test("getNextPage", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.getNextPage();
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "b");

    sinon.stub(col, "fetch");

    col.getPreviousPage();
    col.getNextPage({fetch: true});
    ok(col.fetch.calledOnce);
  });

  test("getLastPage", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.getLastPage();
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "b");

    sinon.stub(col, "fetch");

    col.getLastPage({fetch: true});
    ok(col.fetch.calledOnce);
  });

  test("setPageSize", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.setPageSize(1);

    strictEqual(col.state.pageSize, 1);
    strictEqual(col.state.totalPages, 3);
    strictEqual(col.state.lastPage, 3);
  });

  test("issue #15", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2,
        currentPage: 2
      },
      mode: "client"
    });

    col.fullCollection.remove(col.fullCollection.last());
    strictEqual(col.state.currentPage, 1);
    strictEqual(col.state.totalRecords, 2);
    strictEqual(col.state.lastPage, 1);
    strictEqual(col.state.totalPages, 1);
  });

  test("hasNext and hasPrevious", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 1
      },
      mode: "client"
    });

    strictEqual(col.hasPrevious(), false);
    strictEqual(col.hasNext(), true);

    col.getNextPage();

    strictEqual(col.hasPrevious(), true);
    strictEqual(col.hasNext(), true);

    col.getLastPage();

    strictEqual(col.hasPrevious(), true);
    strictEqual(col.hasNext(), false);
  });

});
