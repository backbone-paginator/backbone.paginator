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
    ok(fullCol.comparator === comparator);
    ok(fullCol.constructor.prototype.sync === sync);
    ok(fullCol.sync === sync);
    ok(fullCol.constructor.prototype.model === Backbone.Model);
    ok(fullCol.model === Backbone.Model);
    ok(fullCol.constructor.prototype.url === "test/makeFullCollection");
    ok(fullCol.url === "test/makeFullCollection");
    ok(fullCol.at(0).get("name") === "a");
    ok(fullCol.at(1).get("name") === "b");
    ok(fullCol.at(2).get("name") === "c");

    a.collection = col;
    c.collection = col;
    b.collection = col;

    fullCol = col._makeFullCollection([
      a, c, b
    ]);

    ok(fullCol.at(0).get("name") === "a");
    ok(fullCol.at(1).get("name") === "c");
    ok(fullCol.at(2).get("name") === "b");

    ok(fullCol.at(0).collection === col);
    ok(fullCol.at(1).collection === col);
    ok(fullCol.at(2).collection === col);
  });

  test("initialize", function () {

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

    ok(col.state.totalRecords === 3);
    ok(col.comparator === comparator);
    ok(col.size() === 2);
    ok(col.at(0).get("name") === "a");
    ok(col.at(1).get("name") === "c");
    ok(col.fullCollection.size() === 3);
    ok(col.at(0) === col.fullCollection.at(0));
    ok(col.fullCollection.at(0).get("name") === "a");
    ok(col.fullCollection.at(1).get("name") === "c");
    ok(col.fullCollection.at(2).get("name") === "b");

    mods = models.slice();

    col = new Backbone.PageableCollection(mods, {
      state: {
        pageSize: 1,
        sortKey: "name"
      },
      full: true,
      mode: "client"
    });

    ok(col.state.totalRecords === 3);
    ok(!_.isUndefined(col.fullCollection.comparator));
    ok(_.isUndefined(col.comparator));

    ok(col.size() === 1);
    ok(col.at(0).get("name") === "a");
    ok(col.fullCollection.size() === 3);
    ok(col.fullCollection.at(0).get("name") === "a");
    ok(col.fullCollection.at(1).get("name") === "b");
    ok(col.fullCollection.at(2).get("name") === "c");
  });

  test("add", 27, function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    var onAdd = function () {
      ok(true);
    };
    col.fullCollection.on("add", onAdd);
    col.on("add", onAdd);

    var d = new Backbone.Model({name: "d"});
    col.add(d);
    ok(col.state.totalRecords === 4);
    ok(col.state.totalPages === 2);
    ok(col.size() === 2);
    ok(col.at(0).get("name") === "a");
    ok(col.at(1).get("name") === "c");
    ok(col.fullCollection.at(0).get("name") === "a");
    ok(col.fullCollection.at(1).get("name") === "c");
    ok(col.fullCollection.at(2).get("name") === "d");
    ok(col.fullCollection.at(3).get("name") === "b");

    var e = new Backbone.Model({name: "e"});
    col.fullCollection.push(e);
    ok(col.state.totalRecords === 5);
    ok(col.state.totalPages === 3);
    ok(col.size() === 2);
    ok(col.at(0).get("name") === "a");
    ok(col.at(1).get("name") === "c");
    ok(col.fullCollection.at(4).get("name") === "e");
    ok(col.indexOf(e.cid) === -1);

    var f = new Backbone.Model({name: "f"});
    col.fullCollection.unshift(f);
    ok(col.state.totalRecords === 6);
    ok(col.state.totalPages === 3);
    ok(col.fullCollection.size() === 6);
    ok(col.size() === 2);
    ok(col.at(0).get("name") === "f");
    ok(col.at(1).get("name") === "a");
  });

  test("remove", 32, function () {

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

    var onRemove = function () {
      ok(true);
    };
    col.on("remove", onRemove);
    col.fullCollection.on("remove", onRemove);

    col.fullCollection.remove(col.fullCollection.last());
    ok(col.state.totalRecords === 3);
    ok(col.state.totalPages === 3);
    ok(col.size() === 1);
    ok(col.at(0).get("name") === "a");
    ok(col.fullCollection.size() === 3);
    ok(col.fullCollection.at(0).get("name") === "a");
    ok(col.fullCollection.at(1).get("name") === "c");
    ok(col.fullCollection.at(2).get("name") === "b");

    col.fullCollection.remove(col.fullCollection.first());
    ok(col.state.totalRecords === 2);
    ok(col.state.totalPages === 2);
    ok(col.size() === 1);
    ok(col.at(0).get("name") === "c");
    ok(col.fullCollection.size() === 2);
    ok(col.fullCollection.at(0).get("name") === "c");
    ok(col.fullCollection.at(1).get("name") === "b");

    col.remove(col.first());
    ok(col.state.totalRecords === 1);
    ok(col.state.totalPages === 1);
    ok(col.size() === 1);
    ok(col.at(0).get("name") === "b");
    ok(col.fullCollection.size() === 1);
    ok(col.fullCollection.at(0).get("name") === "b");

    col.remove(col.fullCollection.first());
    ok(col.state.totalRecords === null);
    ok(col.state.totalPages === null);
    ok(col.size() === 0);
    ok(col.fullCollection.size() === 0);
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
    ok(col.fullCollection.at(0).get("name") === "e");
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
        pageSize: 2
      },
      mode: "client"
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

    ok(col.size() === 2);
    ok(col.at(0).get("name") === "e");
    ok(col.at(1).get("name") === "f");

    col.fullCollection.comparator = comparator;
    col.fullCollection.sort();

    ok(col.size() === 2);
    ok(col.at(0).get("name") === "d");
    ok(col.at(1).get("name") === "e");

    mods = models.slice();

    col = new Backbone.PageableCollection(mods, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);

    col.comparator = comparator;
    col.sort();

    ok(col.at(0).get("name") === "a");
    ok(col.at(1).get("name") === "c");

    ok(col.fullCollection.at(0).get("name") === "a");
    ok(col.fullCollection.at(1).get("name") === "c");
    ok(col.fullCollection.at(2).get("name") === "b");

    col.comparator = null;

    mods = [new Backbone.Model({name: "g"}), col.at(0)];
    col.reset(mods);
    ok(col.at(0).get("name") === "g");
    ok(col.at(1).get("name") === "a");
    ok(col.fullCollection.at(0).get("name") === "g");
    ok(col.fullCollection.at(1).get("name") === "a");
    ok(col.fullCollection.at(2).get("name") === "b");

    col.fullCollection.reset([
      {name: "j"},
      {name: "h"},
      {name: "i"},
      {name: "k"}
    ]);

    ok(col.size() === 2);
    ok(col.at(0).get("name") === "j");
    ok(col.at(1).get("name") === "h");
    ok(col.fullCollection.at(0).get("name") === "j");
    ok(col.fullCollection.at(1).get("name") === "h");
    ok(col.fullCollection.at(2).get("name") === "i");
    ok(col.fullCollection.at(3).get("name") === "k");
    ok(col.state.totalRecords === 4);
    ok(col.state.lastPage === 2);
    ok(col.state.totalPages === 2);
  });

  test("fetch", function () {

    if (Backbone.VERSION === "0.9.2") expect(11);
    else expect(10);

    var ajax = jQuery.ajax;
    jQuery.ajax = function (settings) {

      ok(settings.url === "test-client-fetch");
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

    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);

    col.fetch();

    ok(col.at(0).get("name") === "d");
    ok(col.at(1).get("name") === "c");
    ok(col.fullCollection.at(0).get("name") === "d");
    ok(col.fullCollection.at(1).get("name") === "c");
    ok(col.fullCollection.at(2).get("name") === "b");
    ok(col.fullCollection.at(3).get("name") === "a");

    jQuery.ajax = ajax;
  });

  test("getPage", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.getPage(2);
    ok(col.size() === 1);
    ok(col.at(0).get("name") === "b");

    this.stub(col, "fetch");

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
    ok(col.size() === 2);
    ok(col.at(0).get("name") === "a");
    ok(col.at(1).get("name") === "c");

    this.stub(col, "fetch");

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
    ok(col.size() === 2);
    ok(col.at(0).get("name") === "a");
    ok(col.at(1).get("name") === "c");

    this.stub(col, "fetch");

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
    ok(col.size() === 1);
    ok(col.at(0).get("name") === "b");

    this.stub(col, "fetch");

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
    ok(col.size() === 1);
    ok(col.at(0).get("name") === "b");

    this.stub(col, "fetch");

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

    ok(col.state.pageSize === 1);
    ok(col.state.totalPages === 3);
    ok(col.state.lastPage === 3);
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
    ok(col.state.currentPage === 1);
    ok(col.state.totalRecords === 2);
    ok(col.state.lastPage === 1);
    ok(col.state.totalPages === 1);
  });

});
