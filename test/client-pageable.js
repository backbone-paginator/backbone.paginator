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
      model: Backbone.Model
    }))();

    col.sync = sync;

    var fullCol = col._makeFullCollection(models,
                                          {comparator: comparator});

    ok(!_.isUndefined(fullCol));
    ok(_.isUndefined(fullCol.constructor.prototype.comparator));
    strictEqual(fullCol.comparator, comparator);
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

  test("constructor", 28, function () {

    // TODO: test options.full attaches comparator to fullcollection only

    var col = new Backbone.PageableCollection(null, {
      mode: "client"
    });

    ok(col);
    ok(col.fullCollection);

    var mods = models.slice();

    col = new Backbone.PageableCollection(mods[0], {
      mode: "client"
    });

    strictEqual(col.state.totalRecords, 1);
    strictEqual(col.fullCollection.size(), 1);
    strictEqual(col.fullCollection.at(0).get("name"), "a");

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
    strictEqual(col.at(1).get("name"), "b");
    strictEqual(col.fullCollection.size(), 3);
    strictEqual(col.at(0), col.fullCollection.at(0));
    strictEqual(col.fullCollection.at(0).get("name"), "a");
    strictEqual(col.fullCollection.at(1).get("name"), "b");
    strictEqual(col.fullCollection.at(2).get("name"), "c");

    mods = models.slice();

    col = new Backbone.PageableCollection(mods, {
      state: {
        pageSize: 2,
        sortKey: "name"
      },
      full: true,
      mode: "client"
    });

    strictEqual(col.state.totalRecords, 3);
    ok(col.fullCollection.comparator);
    ok(!col.comparator);

    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "b");
    strictEqual(col.fullCollection.size(), 3);
    strictEqual(col.fullCollection.at(0).get("name"), "a");
    strictEqual(col.fullCollection.at(1).get("name"), "b");
    strictEqual(col.fullCollection.at(2).get("name"), "c");

    // make sure the given models are copied
    col = new Backbone.PageableCollection(mods, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });
    notStrictEqual(mods.length, col.models.length);
    notDeepEqual(mods, col.models);
    strictEqual(mods.length, col.fullCollection.length);
  });

  test("add", 55, function () {
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
    sinon.spy(col, "trigger");

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
    ok(col.trigger.calledWith("pageable:state:change", col.state));

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
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    lastTotalRecords = col.state.totalRecords;
    var f = new Backbone.Model({name: "f"});
    col.fullCollection.unshift(f);
    strictEqual(col.state.totalRecords, 6);
    strictEqual(col.state.totalPages, 3);
    strictEqual(col.fullCollection.size(), 6);
    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "f");
    strictEqual(col.at(1).get("name"), "a");
    ok(col.trigger.calledWith("pageable:state:change", col.state));

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
    ok(col.trigger.calledWith("pageable:state:change", col.state));

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
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();
    col.fullCollection.reset();
    col.fullCollection.add([{name: "a"}, {name: "c"}, {name: "b"}]);
    strictEqual(col.size(), 2);
    strictEqual(col.fullCollection.size(), 3);
    deepEqual(col.toJSON(), [{name: "a"}, {name: "c"}]);
    deepEqual(col.fullCollection.toJSON(), [{name: "a"}, {name: "c"}, {name: "b"}]);
    ok(col.trigger.calledWith("pageable:state:change", col.state));
  });

  test("remove", 114, function () {

    var col = new Backbone.PageableCollection([
      {"name": "a"},
      {"name": "c"},
      {"name": "b"},
      {"name": "d"}
    ], {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    var lastTotalRecords = col.state.totalRecords;
    var lastTotalPages = col.state.totalPages;
    var onRemove = function () {
      ok(true);
      strictEqual(col.state.totalRecords, lastTotalRecords - 1);
      strictEqual(col.state.totalPages, Math.ceil(col.state.totalRecords / col.state.pageSize));
    };
    col.on("remove", onRemove);
    sinon.spy(col, "trigger");
    col.fullCollection.on("remove", onRemove);

    col.fullCollection.remove(col.fullCollection.last());
    strictEqual(col.state.totalRecords, 3);
    strictEqual(col.state.totalPages, 2);
    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");
    strictEqual(col.fullCollection.size(), 3);
    strictEqual(col.fullCollection.at(0).get("name"), "a");
    strictEqual(col.fullCollection.at(1).get("name"), "c");
    strictEqual(col.fullCollection.at(2).get("name"), "b");
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    lastTotalRecords = col.state.totalRecords;
    lastTotalPages = col.state.totalPages;
    col.fullCollection.remove(col.fullCollection.first());
    strictEqual(col.state.totalRecords, 2);
    strictEqual(col.state.totalPages, 1);
    strictEqual(col.size(), 2);
    strictEqual(col.at(0).get("name"), "c");
    strictEqual(col.at(1).get("name"), "b");
    strictEqual(col.fullCollection.size(), 2);
    strictEqual(col.fullCollection.at(0).get("name"), "c");
    strictEqual(col.fullCollection.at(1).get("name"), "b");
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    lastTotalRecords = col.state.totalRecords;
    lastTotalPages = col.state.totalPages;
    col.remove(col.first());
    strictEqual(col.state.totalRecords, 1);
    strictEqual(col.state.totalPages, 1);
    strictEqual(col.size(), 1);
    strictEqual(col.at(0).get("name"), "b");
    strictEqual(col.fullCollection.size(), 1);
    strictEqual(col.fullCollection.at(0).get("name"), "b");
    ok(col.trigger.calledWith("pageable:state:change", col.state));

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
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    strictEqual(col.state.totalRecords, null);
    strictEqual(col.state.totalPages, null);
    strictEqual(col.size(), 0);
    strictEqual(col.fullCollection.size(), 0);

    col = new Backbone.PageableCollection([
      {"name": "a"},
      {"name": "c"},
      {"name": "b"},
      {"name": "d"},
      {"name": "f"},
    ], {
      state: {
        pageSize: 2
      },
      mode: "client"
    });
    sinon.spy(col, "trigger");

    // tests for insertion into current page by removing from fullCollection
    col.fullCollection.remove(col.fullCollection.at(0));
    strictEqual(col.at(0).get("name"), "c");
    strictEqual(col.at(1).get("name"), "b");
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    col.fullCollection.remove(col.fullCollection.at(2));
    strictEqual(col.at(0).get("name"), "c");
    strictEqual(col.at(1).get("name"), "b");
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    col.fullCollection.remove(col.fullCollection.at(1));
    strictEqual(col.at(0).get("name"), "c");
    strictEqual(col.at(1).get("name"), "f");
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    col.fullCollection.remove(col.fullCollection.at(0));
    strictEqual(col.at(0).get("name"), "f");
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    col.fullCollection.remove(col.fullCollection.at(0));
    strictEqual(col.length, 0);
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    // issue 129 and 132, insertion into current page by removing from the current page
    col = new Backbone.PageableCollection([
      {"name": "a"},
      {"name": "c"},
      {"name": "b"},
      {"name": "e"},
      {"name": "f"},
      {"name": "d"},
      {"name": "g"}
    ], {
      state: {
        pageSize: 3
      },
      mode: "client"
    });
    sinon.spy(col, "trigger");

    col.remove(col.first());
    strictEqual(col.state.totalRecords, 6);
    strictEqual(col.size(), 3);
    strictEqual(col.fullCollection.size(), 6);
    deepEqual(col.toJSON(), [
      {"name": "c"},
      {"name": "b"},
      {"name": "e"}
    ]);
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    col.remove(col.at(1));
    strictEqual(col.state.totalRecords, 5);
    strictEqual(col.size(), 3);
    strictEqual(col.fullCollection.size(), 5);
    deepEqual(col.toJSON(), [
      {"name": "c"},
      {"name": "e"},
      {"name": "f"}
    ]);
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    col.remove(col.last());
    strictEqual(col.state.totalRecords, 4);
    strictEqual(col.size(), 3);
    strictEqual(col.fullCollection.size(), 4);
    deepEqual(col.toJSON(), [
      {"name": "c"},
      {"name": "e"},
      {"name": "d"}
    ]);
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    col.remove(col.first());
    strictEqual(col.state.totalRecords, 3);
    strictEqual(col.size(), 3);
    strictEqual(col.fullCollection.size(), 3);
    deepEqual(col.toJSON(), [
      {"name": "e"},
      {"name": "d"},
      {"name": "g"}
    ]);
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    col.remove(col.at(1));
    strictEqual(col.state.totalRecords, 2);
    strictEqual(col.size(), 2);
    strictEqual(col.fullCollection.size(), 2);
    deepEqual(col.toJSON(), [
      {"name": "e"},
      {"name": "g"}
    ]);
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    col.remove(col.last());
    strictEqual(col.state.totalRecords, 1);
    strictEqual(col.size(), 1);
    strictEqual(col.fullCollection.size(), 1);
    deepEqual(col.toJSON(), [
      {"name": "e"}
    ]);
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    col.remove(col.first());
    strictEqual(col.state.totalRecords, null);
    strictEqual(col.size(), 0);
    strictEqual(col.fullCollection.size(), 0);
    deepEqual(col.toJSON(), []);
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    // Make sure removing the last model from the last page will reset the
    // current page to the actual last page
    col = new Backbone.PageableCollection([
      {"name": "a"},
      {"name": "c"},
      {"name": "b"},
      {"name": "d"}
    ], {
      state: {
        pageSize: 2
      },
      mode: "client"
    });
    sinon.spy(col, "trigger");
    col.getLastPage();

    col.remove(col.last());
    strictEqual(col.length, 1);
    strictEqual(col.at(0).get("name"), "b");
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    col.remove(col.last());
    strictEqual(col.length, 2);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col = new Backbone.PageableCollection([
      {"name": "a"},
      {"name": "c"},
      {"name": "b"},
      {"name": "d"}
    ], {
      state: {
        pageSize: 2
      },
      mode: "client"
    });
    sinon.spy(col, "trigger");
    col.getLastPage();

    col.fullCollection.remove(col.fullCollection.last());
    strictEqual(col.length, 1);
    strictEqual(col.at(0).get("name"), "b");
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

    col.fullCollection.remove(col.fullCollection.last());
    strictEqual(col.length, 2);
    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");
    ok(col.trigger.calledWith("pageable:state:change", col.state));
  });

  test("add handlers on pageCol are run before remove handlers", 2, function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 1
      },
      mode: "client"
    });

    var queue = [];
    col.on("add", function () {
      queue.push("add");
    });
    col.on("remove", function () {
      queue.push("remove");
    });

    col.unshift(new Backbone.Model({name: "d"}));
    deepEqual(queue, ["add", "remove"]);

    queue = [];
    col.fullCollection.unshift(new Backbone.Model({name: "e"}));
    deepEqual(queue, ["add", "remove"]);
  });

  test("remove handlers on pageCol are run before add handlers", 2, function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 1
      },
      mode: "client"
    });

    var queue = [];
    col.on("add", function () {
      queue.push("add");
    });
    col.on("remove", function () {
      queue.push("remove");
    });

    col.remove(col.at(0));
    deepEqual(queue, ["remove", "add"]);

    queue = [];
    col.fullCollection.remove(col.at(0));
    deepEqual(queue, ["remove", "add"]);
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
    this.ajaxSettings.success();

    col.fullCollection.at(0).save();
    this.ajaxSettings.success();

    col.fullCollection.at(1).save();
    this.ajaxSettings.success();
  });

  test("reset and sort", 79, function () {

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
    sinon.spy(col, "trigger");
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
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

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
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.reset();

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
    ok(col.trigger.calledWith("pageable:state:change", col.state));
  });

  test("fetch", 14, function () {

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

    var resetCount = 0;
    var onReset = function () {
      resetCount++;
      ok(true);
    };

    var fullResetCount = 0;
    var onFullReset = function () {
      fullResetCount++;
      ok(true);
    };

    col.on("reset", onReset);
    col.fullCollection.on("reset", onFullReset);

    var parseCount = 0;
    var oldParse = col.parse;
    col.parse = function () {
      parseCount++;
      ok(true);
      return oldParse.apply(this, arguments);
    };
    col.fetch();

    strictEqual(this.ajaxSettings.url, "test-client-fetch");
    deepEqual(this.ajaxSettings.data, {
      "sort_by": "name",
      "order": "desc"
    });

    this.ajaxSettings.success([
      {name: "a"},
      {name: "c"},
      {name: "d"},
      {name: "b"}
    ]);

    col.parse = oldParse;

    equal(resetCount, 1);
    equal(fullResetCount, 1);
    equal(parseCount, 1);
    strictEqual(col.at(0).get("name"), "d");
    strictEqual(col.at(1).get("name"), "c");
    strictEqual(col.fullCollection.at(0).get("name"), "d");
    strictEqual(col.fullCollection.at(1).get("name"), "c");
    strictEqual(col.fullCollection.at(2).get("name"), "b");
    strictEqual(col.fullCollection.at(3).get("name"), "a");
  });

  test("getPageByOffset - firstPage is 0", function () {
    var manyModels = [
      {"name": "a1"},
      {"name": "a2"},
      {"name": "b1"},
      {"name": "b2"},
      {"name": "c1"},
      {"name": "c2"}
    ];
    var col = new Backbone.PageableCollection(manyModels, {
      state: {
        pageSize: 2,
        firstPage: 0,
        currentPage: 0,
      },
      mode: "client"
    });
    strictEqual(col.state.currentPage, 0);

    col.getPageByOffset(2);
    strictEqual(1, col.state.currentPage);
    strictEqual("b1", col.at(0).get("name"));

    col.getPageByOffset(1);
    strictEqual(0, col.state.currentPage);
    strictEqual("a1", col.at(0).get("name"));

    col.getPageByOffset(col.state.totalRecords - 1);
    strictEqual(2, col.state.currentPage);
    strictEqual("c1", col.at(0).get("name"));

    sinon.stub(col, "getPage");
    col.getPageByOffset(0);
    ok(col.getPage.calledOnce);
  });

  test("getPageByOffset - firstPage is 1", function () {
    var manyModels = [
      {"name": "a1"},
      {"name": "a2"},
      {"name": "b1"},
      {"name": "b2"},
      {"name": "c1"},
      {"name": "c2"}
    ];
    var col = new Backbone.PageableCollection(manyModels, {
      state: {
        pageSize: 2,
        firstPage: 1,
        currentPage: 1
      },
      mode: "client"
    });
    strictEqual(1, col.state.currentPage);

    col.getPageByOffset(2);
    strictEqual(2, col.state.currentPage);
    strictEqual("b1", col.at(0).get("name"));

    col.getPageByOffset(1);
    strictEqual(1, col.state.currentPage);
    strictEqual("a1", col.at(0).get("name"));

    col.getPageByOffset(col.state.totalRecords - 1);
    strictEqual(3, col.state.currentPage);
    strictEqual("c1", col.at(0).get("name"));

    sinon.stub(col, "getPage");
    col.getPageByOffset(0);
    ok(col.getPage.calledOnce);
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

    // decrease page size
    col.setPageSize(1);

    strictEqual(col.state.pageSize, 1);
    strictEqual(col.state.totalPages, 3);
    strictEqual(col.state.lastPage, 3);
    strictEqual(col.state.currentPage, 1);
    strictEqual(col.length, 1);
    strictEqual(col.fullCollection.length, 3);

    // increase page size
    col.setPageSize(3);

    strictEqual(col.state.pageSize, 3);
    strictEqual(col.state.totalPages, 1);
    strictEqual(col.state.lastPage, 1);
    strictEqual(col.state.currentPage, 1);
    strictEqual(col.length, 3);
    strictEqual(col.fullCollection.length, 3);

    col = new Backbone.PageableCollection(null, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.setPageSize(1);

    strictEqual(col.state.pageSize, 1);
    strictEqual(col.state.totalPages, 0);
    strictEqual(col.state.lastPage, null);
    strictEqual(col.state.currentPage, 1);

    col.setPageSize(3);

    strictEqual(col.state.pageSize, 3);
    strictEqual(col.state.totalPages, 0);
    strictEqual(col.state.lastPage, null);
    strictEqual(col.state.currentPage, 1);

    // test again for 0-base page indices
    col = new Backbone.PageableCollection(models, {
      state: {
        firstPage: 0,
        pageSize: 2
      },
      mode: "client"
    });

    col.setPageSize(3);

    strictEqual(col.state.pageSize, 3);
    strictEqual(col.state.totalPages, 1);
    strictEqual(col.state.lastPage, 0);
    strictEqual(col.state.currentPage, 0);
    strictEqual(col.length, 3);
    strictEqual(col.fullCollection.length, 3);

    col.setPageSize(1);

    strictEqual(col.state.pageSize, 1);
    strictEqual(col.state.totalPages, 3);
    strictEqual(col.state.lastPage, 2);
    strictEqual(col.state.currentPage, 0);
    strictEqual(col.length, 1);
    strictEqual(col.fullCollection.length, 3);
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

  test("hasNextPage and hasPreviousPage", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 1
      },
      mode: "client"
    });

    strictEqual(col.hasPreviousPage(), false);
    strictEqual(col.hasNextPage(), true);

    col.getNextPage();

    strictEqual(col.hasPreviousPage(), true);
    strictEqual(col.hasNextPage(), true);

    col.getLastPage();

    strictEqual(col.hasPreviousPage(), true);
    strictEqual(col.hasNextPage(), false);
  });

  test("parsing from constructor #112", function () {
    var Model = Backbone.Model.extend({
      parse: function (raw) {
        return { value: raw };
      }
    });

    var MyCollection = Backbone.PageableCollection.extend({
      model: Model,
      mode: 'client',
      state: {
        firstPage: 0,
        pageSize: 2
      }
    });

    var col = new MyCollection([1, 2, 3], {parse: true});
    deepEqual(col.toJSON(), [{"value": 1}, {"value": 2}]);
    deepEqual(col.fullCollection.toJSON(), [{"value": 1}, {"value": 2}, {"value": 3}]);
  });

   test("issue #309", function () {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2,
        currentPage: 2
      },
      mode: "client"
    });

    strictEqual(col.state.totalRecords, 3);
    strictEqual(col.state.lastPage, 2);
    strictEqual(col.state.totalPages, 2);
    strictEqual(col.state.currentPage, 2);
    strictEqual(col.at(0).get("name"), "b");
    col.fullCollection.reset(models);
    strictEqual(col.state.currentPage, 1);
    strictEqual(col.at(0).get("name"), "a");
  });

});
