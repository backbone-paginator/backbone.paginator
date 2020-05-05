$(document).ready(function () {

  "use strict";

  var a, c, b, models, comparator;

  QUnit.module("Backbone.PageableCollection - Client", {

    beforeEach: function () {

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

      this.xhr = sinon.useFakeXMLHttpRequest();
      var requests = this.requests = [];
      this.xhr.onCreate = function (xhr) {
        requests.push(xhr);
      }
    },

    afterEach: function () {
      this.xhr.restore();
    }
  });

  QUnit.test("_makeFullCollection", function (assert) {

    var sync = function () {};

    var col = new (Backbone.PageableCollection.extend({
      url: "test/makeFullCollection",
      model: Backbone.Model
    }))();

    col.sync = sync;

    var fullCol = col._makeFullCollection(models,
                                          {comparator: comparator});

    assert.ok(!_.isUndefined(fullCol));
    assert.ok(_.isUndefined(fullCol.constructor.prototype.comparator));
    assert.strictEqual(fullCol.comparator, comparator);
    assert.strictEqual(fullCol.sync, sync);
    assert.strictEqual(fullCol.constructor.prototype.model, Backbone.Model);
    assert.strictEqual(fullCol.model, Backbone.Model);
    assert.strictEqual(fullCol.constructor.prototype.url, "test/makeFullCollection");
    assert.strictEqual(fullCol.url, "test/makeFullCollection");
    assert.strictEqual(fullCol.at(0).get("name"), "a");
    assert.strictEqual(fullCol.at(1).get("name"), "b");
    assert.strictEqual(fullCol.at(2).get("name"), "c");

    a.collection = col;
    c.collection = col;
    b.collection = col;

    fullCol = col._makeFullCollection([
      a, c, b
    ]);

    assert.strictEqual(fullCol.at(0).get("name"), "a");
    assert.strictEqual(fullCol.at(1).get("name"), "c");
    assert.strictEqual(fullCol.at(2).get("name"), "b");

    assert.strictEqual(fullCol.at(0).collection, col);
    assert.strictEqual(fullCol.at(1).collection, col);
    assert.strictEqual(fullCol.at(2).collection, col);
  });

  QUnit.test("constructor", function (assert) {

    // TODO: test options.full attaches comparator to fullcollection only

    assert.expect(28);

    var col = new Backbone.PageableCollection(null, {
      mode: "client"
    });

    assert.ok(col);
    assert.ok(col.fullCollection);

    var mods = models.slice();

    col = new Backbone.PageableCollection(mods[0], {
      mode: "client"
    });

    assert.strictEqual(col.state.totalRecords, 1);
    assert.strictEqual(col.fullCollection.size(), 1);
    assert.strictEqual(col.fullCollection.at(0).get("name"), "a");

    col = new Backbone.PageableCollection(mods, {
      comparator: comparator,
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    assert.strictEqual(col.state.totalRecords, 3);
    assert.strictEqual(col.comparator, comparator);
    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.at(0).get("name"), "a");
    assert.strictEqual(col.at(1).get("name"), "b");
    assert.strictEqual(col.fullCollection.size(), 3);
    assert.strictEqual(col.at(0), col.fullCollection.at(0));
    assert.strictEqual(col.fullCollection.at(0).get("name"), "a");
    assert.strictEqual(col.fullCollection.at(1).get("name"), "b");
    assert.strictEqual(col.fullCollection.at(2).get("name"), "c");

    mods = models.slice();

    col = new Backbone.PageableCollection(mods, {
      state: {
        pageSize: 2,
        sortKey: "name"
      },
      full: true,
      mode: "client"
    });

    assert.strictEqual(col.state.totalRecords, 3);
    assert.ok(col.fullCollection.comparator);
    assert.ok(!col.comparator);

    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.at(0).get("name"), "a");
    assert.strictEqual(col.at(1).get("name"), "b");
    assert.strictEqual(col.fullCollection.size(), 3);
    assert.strictEqual(col.fullCollection.at(0).get("name"), "a");
    assert.strictEqual(col.fullCollection.at(1).get("name"), "b");
    assert.strictEqual(col.fullCollection.at(2).get("name"), "c");

    // make sure the given models are copied
    col = new Backbone.PageableCollection(mods, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });
    assert.notStrictEqual(mods.length, col.models.length);
    assert.notDeepEqual(mods, col.models);
    assert.strictEqual(mods.length, col.fullCollection.length);
  });

  QUnit.test("add", function (assert) {
    assert.expect(55);

    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    var lastTotalRecords = col.state.totalRecords;
    var onAdd = function () {
      assert.strictEqual(col.state.totalRecords, lastTotalRecords + 1);
    };
    col.fullCollection.on("add", onAdd);
    col.on("add", onAdd);
    sinon.spy(col, "trigger");

    var d = new Backbone.Model({name: "d"});
    col.add(d);
    assert.strictEqual(col.state.totalRecords, 4);
    assert.strictEqual(col.state.totalPages, 2);
    assert.strictEqual(col.fullCollection.size(), 4);
    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.at(0).get("name"), "a");
    assert.strictEqual(col.at(1).get("name"), "c");
    assert.strictEqual(col.fullCollection.at(0).get("name"), "a");
    assert.strictEqual(col.fullCollection.at(1).get("name"), "c");
    assert.strictEqual(col.fullCollection.at(2).get("name"), "d");
    assert.strictEqual(col.fullCollection.at(3).get("name"), "b");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    lastTotalRecords = col.state.totalRecords;
    var e = new Backbone.Model({name: "e"});
    col.fullCollection.push(e);
    assert.strictEqual(col.state.totalRecords, 5);
    assert.strictEqual(col.state.totalPages, 3);
    assert.strictEqual(col.fullCollection.size(), 5);
    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.at(0).get("name"), "a");
    assert.strictEqual(col.at(1).get("name"), "c");
    assert.strictEqual(col.fullCollection.at(4).get("name"), "e");
    assert.strictEqual(col.indexOf(e.cid), -1);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    lastTotalRecords = col.state.totalRecords;
    var f = new Backbone.Model({name: "f"});
    col.fullCollection.unshift(f);
    assert.strictEqual(col.state.totalRecords, 6);
    assert.strictEqual(col.state.totalPages, 3);
    assert.strictEqual(col.fullCollection.size(), 6);
    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.at(0).get("name"), "f");
    assert.strictEqual(col.at(1).get("name"), "a");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    // test add at page col on page 2
    col.getPage(2);
    lastTotalRecords = col.state.totalRecords;
    var g = new Backbone.Model({name: "g"});
    col.add(g, {at: 1});
    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.fullCollection.size(), 7);
    assert.strictEqual(col.state.totalRecords, 7);
    assert.strictEqual(col.state.totalPages, 4);
    assert.strictEqual(col.state.lastPage, 4);
    assert.strictEqual(col.state.currentPage, 2);
    assert.strictEqual(col.last().get("name"), "g");
    assert.strictEqual(col.fullCollection.at(3).get("name"), "g");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    // test ability to add to empty collection
    col.fullCollection.reset();
    lastTotalRecords = col.state.totalRecords;
    col.add(new Backbone.Model({name: "a"}));

    // test ability to add an array of models
    col.off("add", onAdd);
    col.fullCollection.off("add", onAdd);
    col.fullCollection.reset();
    col.add([{name: "a"}, {name: "c"}, {name: "b"}]);
    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.fullCollection.size(), 3);
    assert.deepEqual(col.toJSON(), [{name: "a"}, {name: "c"}]);
    assert.deepEqual(col.fullCollection.toJSON(), [{name: "a"}, {name: "c"}, {name: "b"}]);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();
    col.fullCollection.reset();
    col.fullCollection.add([{name: "a"}, {name: "c"}, {name: "b"}]);
    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.fullCollection.size(), 3);
    assert.deepEqual(col.toJSON(), [{name: "a"}, {name: "c"}]);
    assert.deepEqual(col.fullCollection.toJSON(), [{name: "a"}, {name: "c"}, {name: "b"}]);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));
  });

  QUnit.test("remove", function (assert) {
    assert.expect(114);

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
      assert.ok(true);
      assert.strictEqual(col.state.totalRecords, lastTotalRecords - 1);
      assert.strictEqual(col.state.totalPages, Math.ceil(col.state.totalRecords / col.state.pageSize));
    };
    col.on("remove", onRemove);
    sinon.spy(col, "trigger");
    col.fullCollection.on("remove", onRemove);

    col.fullCollection.remove(col.fullCollection.last());
    assert.strictEqual(col.state.totalRecords, 3);
    assert.strictEqual(col.state.totalPages, 2);
    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.at(0).get("name"), "a");
    assert.strictEqual(col.at(1).get("name"), "c");
    assert.strictEqual(col.fullCollection.size(), 3);
    assert.strictEqual(col.fullCollection.at(0).get("name"), "a");
    assert.strictEqual(col.fullCollection.at(1).get("name"), "c");
    assert.strictEqual(col.fullCollection.at(2).get("name"), "b");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    lastTotalRecords = col.state.totalRecords;
    lastTotalPages = col.state.totalPages;
    col.fullCollection.remove(col.fullCollection.first());
    assert.strictEqual(col.state.totalRecords, 2);
    assert.strictEqual(col.state.totalPages, 1);
    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.at(0).get("name"), "c");
    assert.strictEqual(col.at(1).get("name"), "b");
    assert.strictEqual(col.fullCollection.size(), 2);
    assert.strictEqual(col.fullCollection.at(0).get("name"), "c");
    assert.strictEqual(col.fullCollection.at(1).get("name"), "b");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    lastTotalRecords = col.state.totalRecords;
    lastTotalPages = col.state.totalPages;
    col.remove(col.first());
    assert.strictEqual(col.state.totalRecords, 1);
    assert.strictEqual(col.state.totalPages, 1);
    assert.strictEqual(col.size(), 1);
    assert.strictEqual(col.at(0).get("name"), "b");
    assert.strictEqual(col.fullCollection.size(), 1);
    assert.strictEqual(col.fullCollection.at(0).get("name"), "b");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.off("remove", onRemove);
    col.fullCollection.off("remove", onRemove);
    onRemove = function () {
      assert.ok(true);
      assert.strictEqual(col.state.totalRecords, null);
      assert.strictEqual(col.state.totalPages, null);
    };
    col.on("remove", onRemove);
    col.fullCollection.on("remove", onRemove);
    col.remove(col.fullCollection.first());
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    assert.strictEqual(col.state.totalRecords, null);
    assert.strictEqual(col.state.totalPages, null);
    assert.strictEqual(col.size(), 0);
    assert.strictEqual(col.fullCollection.size(), 0);

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
    assert.strictEqual(col.at(0).get("name"), "c");
    assert.strictEqual(col.at(1).get("name"), "b");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.fullCollection.remove(col.fullCollection.at(2));
    assert.strictEqual(col.at(0).get("name"), "c");
    assert.strictEqual(col.at(1).get("name"), "b");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.fullCollection.remove(col.fullCollection.at(1));
    assert.strictEqual(col.at(0).get("name"), "c");
    assert.strictEqual(col.at(1).get("name"), "f");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.fullCollection.remove(col.fullCollection.at(0));
    assert.strictEqual(col.at(0).get("name"), "f");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.fullCollection.remove(col.fullCollection.at(0));
    assert.strictEqual(col.length, 0);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

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
    assert.strictEqual(col.state.totalRecords, 6);
    assert.strictEqual(col.size(), 3);
    assert.strictEqual(col.fullCollection.size(), 6);
    assert.deepEqual(col.toJSON(), [
      {"name": "c"},
      {"name": "b"},
      {"name": "e"}
    ]);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.remove(col.at(1));
    assert.strictEqual(col.state.totalRecords, 5);
    assert.strictEqual(col.size(), 3);
    assert.strictEqual(col.fullCollection.size(), 5);
    assert.deepEqual(col.toJSON(), [
      {"name": "c"},
      {"name": "e"},
      {"name": "f"}
    ]);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.remove(col.last());
    assert.strictEqual(col.state.totalRecords, 4);
    assert.strictEqual(col.size(), 3);
    assert.strictEqual(col.fullCollection.size(), 4);
    assert.deepEqual(col.toJSON(), [
      {"name": "c"},
      {"name": "e"},
      {"name": "d"}
    ]);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.remove(col.first());
    assert.strictEqual(col.state.totalRecords, 3);
    assert.strictEqual(col.size(), 3);
    assert.strictEqual(col.fullCollection.size(), 3);
    assert.deepEqual(col.toJSON(), [
      {"name": "e"},
      {"name": "d"},
      {"name": "g"}
    ]);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.remove(col.at(1));
    assert.strictEqual(col.state.totalRecords, 2);
    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.fullCollection.size(), 2);
    assert.deepEqual(col.toJSON(), [
      {"name": "e"},
      {"name": "g"}
    ]);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.remove(col.last());
    assert.strictEqual(col.state.totalRecords, 1);
    assert.strictEqual(col.size(), 1);
    assert.strictEqual(col.fullCollection.size(), 1);
    assert.deepEqual(col.toJSON(), [
      {"name": "e"}
    ]);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.remove(col.first());
    assert.strictEqual(col.state.totalRecords, null);
    assert.strictEqual(col.size(), 0);
    assert.strictEqual(col.fullCollection.size(), 0);
    assert.deepEqual(col.toJSON(), []);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

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
    assert.strictEqual(col.length, 1);
    assert.strictEqual(col.at(0).get("name"), "b");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.remove(col.last());
    assert.strictEqual(col.length, 2);
    assert.strictEqual(col.at(0).get("name"), "a");
    assert.strictEqual(col.at(1).get("name"), "c");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

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
    assert.strictEqual(col.length, 1);
    assert.strictEqual(col.at(0).get("name"), "b");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.fullCollection.remove(col.fullCollection.last());
    assert.strictEqual(col.length, 2);
    assert.strictEqual(col.at(0).get("name"), "a");
    assert.strictEqual(col.at(1).get("name"), "c");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));
  });

  QUnit.test("add handlers on pageCol are run before remove handlers", function (assert) {
    assert.expect(2);

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
    assert.deepEqual(queue, ["add", "remove"]);

    queue = [];
    col.fullCollection.unshift(new Backbone.Model({name: "e"}));
    assert.deepEqual(queue, ["add", "remove"]);
  });

  QUnit.test("remove handlers on pageCol are run before add handlers", function (assert) {
    assert.expect(2);

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
    assert.deepEqual(queue, ["remove", "add"]);

    queue = [];
    col.fullCollection.remove(col.at(0));
    assert.deepEqual(queue, ["remove", "add"]);
  });

  QUnit.test("change", function (assert) {
    assert.expect(6);

    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 1
      },
      mode: "client"
    });

    var onChange = function () {
      assert.ok(true);
    };
    col.on("change", onChange);
    col.fullCollection.on("change", onChange);
    col.at(0).set("name", "e");
    assert.strictEqual(col.fullCollection.at(0).get("name"), "e");
    col.fullCollection.at(1).set("name", "f");
    col.fullCollection.at(0).set("name", "g");
  });

  QUnit.test("sync", function (assert) {
    assert.expect(5);

    var col = new (Backbone.PageableCollection.extend({
      url: "test-client-sync"
    }))(models, {
      state: {
        pageSize: 1
      },
      mode: "client"
    });

    var onSync = function () {
      assert.ok(true);
    };

    col.on("sync", onSync);
    col.fullCollection.on("sync", onSync);

    col.at(0).save();
    this.requests.shift().respond(200, {}, '{}');

    col.fullCollection.at(0).save();
    this.requests.shift().respond(200, {}, '{}');

    col.fullCollection.at(1).save();
    this.requests.shift().respond(200, {}, '{}');
  });

  QUnit.test("reset and sort", function (assert) {
    assert.expect(79);

    var mods = models.slice();
    var col = new Backbone.PageableCollection(mods, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });
    var onReset = function () {
      assert.ok(true);
      assert.strictEqual(col.state.totalRecords, 4);
      assert.strictEqual(col.state.totalPages, 2);
      assert.strictEqual(col.state.lastPage, 2);
    };
    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);
    col.fullCollection.reset([
      {name: "e"},
      {name: "f"},
      {name: "d"},
      {name: "g"}
    ]);

    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.fullCollection.size(), 4);
    assert.strictEqual(col.at(0).get("name"), "e");
    assert.strictEqual(col.at(1).get("name"), "f");
    assert.strictEqual(col.fullCollection.at(0).get("name"), "e");
    assert.strictEqual(col.fullCollection.at(1).get("name"), "f");
    assert.strictEqual(col.fullCollection.at(2).get("name"), "d");
    assert.strictEqual(col.fullCollection.at(3).get("name"), "g");

    col.fullCollection.comparator = comparator;
    col.fullCollection.sort();

    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.at(0).get("name"), "d");
    assert.strictEqual(col.at(1).get("name"), "e");

    mods = models.slice();
    col = new Backbone.PageableCollection(mods, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });
    onReset = function () {
      assert.ok(true);
      assert.strictEqual(col.state.totalRecords, 3);
      assert.strictEqual(col.state.totalPages, 2);
      assert.strictEqual(col.state.lastPage, 2);
    };
    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);
    sinon.spy(col, "trigger");
    col.comparator = comparator;
    col.sort();

    assert.strictEqual(col.at(0).get("name"), "a");
    assert.strictEqual(col.at(1).get("name"), "c");
    assert.strictEqual(col.fullCollection.at(0).get("name"), "a");
    assert.strictEqual(col.fullCollection.at(1).get("name"), "c");
    assert.strictEqual(col.fullCollection.at(2).get("name"), "b");

    col.comparator = null;
    col.off("reset", onReset);
    col.fullCollection.off("reset", onReset);
    onReset = function () {
      assert.ok(true);
      assert.strictEqual(col.state.totalRecords, 3);
      assert.strictEqual(col.state.totalPages, 2);
      assert.strictEqual(col.state.lastPage, 2);
    };
    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);
    mods = [new Backbone.Model({name: "g"}), col.at(0)];
    col.reset(mods);

    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.fullCollection.size(), 3);
    assert.strictEqual(col.at(0).get("name"), "g");
    assert.strictEqual(col.at(1).get("name"), "a");
    assert.strictEqual(col.fullCollection.at(0).get("name"), "g");
    assert.strictEqual(col.fullCollection.at(1).get("name"), "a");
    assert.strictEqual(col.fullCollection.at(2).get("name"), "b");
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.off("reset", onReset);
    col.fullCollection.off("reset", onReset);
    onReset = function () {
      assert.ok(true);
      assert.strictEqual(col.state.totalRecords, 4);
      assert.strictEqual(col.state.totalPages, 2);
      assert.strictEqual(col.state.lastPage, 2);
    };
    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);
    col.fullCollection.reset([
      {name: "j"},
      {name: "h"},
      {name: "i"},
      {name: "k"}
    ]);

    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.fullCollection.size(), 4);
    assert.strictEqual(col.at(0).get("name"), "j");
    assert.strictEqual(col.at(1).get("name"), "h");
    assert.strictEqual(col.fullCollection.at(0).get("name"), "j");
    assert.strictEqual(col.fullCollection.at(1).get("name"), "h");
    assert.strictEqual(col.fullCollection.at(2).get("name"), "i");
    assert.strictEqual(col.fullCollection.at(3).get("name"), "k");
    assert.strictEqual(col.state.totalRecords, 4);
    assert.strictEqual(col.state.lastPage, 2);
    assert.strictEqual(col.state.totalPages, 2);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.trigger.resetHistory();

    col.off("reset", onReset);
    col.fullCollection.off("reset", onReset);
    onReset = function () {
      assert.ok(true);
      assert.ok(col.state.totalRecords === null);
      assert.ok(col.state.totalPages === null);
      assert.ok(col.state.lastPage === col.state.firstPage);
      assert.ok(col.state.currentPage === col.state.firstPage);
      assert.ok(col.length === 0);
      assert.ok(col.fullCollection.length === 0);
    };
    col.on("reset", onReset);
    col.fullCollection.on("reset", onReset);

    col.fullCollection.reset();
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));
  });

  QUnit.test("fetch", function (assert) {
    assert.expect(13);

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
      assert.ok(true);
    };

    var fullResetCount = 0;
    var onFullReset = function () {
      fullResetCount++;
      assert.ok(true);
    };

    col.on("reset", onReset);
    col.fullCollection.on("reset", onFullReset);

    var parseCount = 0;
    var oldParse = col.parse;
    col.parse = function () {
      parseCount++;
      assert.ok(true);
      return oldParse.apply(this, arguments);
    };
    col.fetch();

    var request = this.requests.shift();
    assert.strictEqual(request.url, "test-client-fetch?sort_by=name&order=desc");

    request.respond(200, {}, JSON.stringify([
      {name: "a"},
      {name: "c"},
      {name: "d"},
      {name: "b"}
    ]))

    col.parse = oldParse;

    assert.equal(resetCount, 1);
    assert.equal(fullResetCount, 1);
    assert.equal(parseCount, 1);
    assert.strictEqual(col.at(0).get("name"), "d");
    assert.strictEqual(col.at(1).get("name"), "c");
    assert.strictEqual(col.fullCollection.at(0).get("name"), "d");
    assert.strictEqual(col.fullCollection.at(1).get("name"), "c");
    assert.strictEqual(col.fullCollection.at(2).get("name"), "b");
    assert.strictEqual(col.fullCollection.at(3).get("name"), "a");
  });

  QUnit.test("getPageByOffset - firstPage is 0", function (assert) {
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
    assert.strictEqual(col.state.currentPage, 0);

    col.getPageByOffset(2);
    assert.strictEqual(1, col.state.currentPage);
    assert.strictEqual("b1", col.at(0).get("name"));

    col.getPageByOffset(1);
    assert.strictEqual(0, col.state.currentPage);
    assert.strictEqual("a1", col.at(0).get("name"));

    col.getPageByOffset(col.state.totalRecords - 1);
    assert.strictEqual(2, col.state.currentPage);
    assert.strictEqual("c1", col.at(0).get("name"));

    sinon.stub(col, "getPage");
    col.getPageByOffset(0);
    assert.ok(col.getPage.calledOnce);
  });

  QUnit.test("getPageByOffset - firstPage is 1", function (assert) {
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
    assert.strictEqual(1, col.state.currentPage);

    col.getPageByOffset(2);
    assert.strictEqual(2, col.state.currentPage);
    assert.strictEqual("b1", col.at(0).get("name"));

    col.getPageByOffset(1);
    assert.strictEqual(1, col.state.currentPage);
    assert.strictEqual("a1", col.at(0).get("name"));

    col.getPageByOffset(col.state.totalRecords - 1);
    assert.strictEqual(3, col.state.currentPage);
    assert.strictEqual("c1", col.at(0).get("name"));

    sinon.stub(col, "getPage");
    col.getPageByOffset(0);
    assert.ok(col.getPage.calledOnce);
  });

  QUnit.test("getPage", function (assert) {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.getPage(2);
    assert.strictEqual(col.size(), 1);
    assert.strictEqual(col.at(0).get("name"), "b");

    sinon.stub(col, "fetch");

    col.getPage(1, {fetch: true});
    assert.ok(col.fetch.calledOnce);
  });

  QUnit.test("getFirstPage", function (assert) {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.getFirstPage();
    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.at(0).get("name"), "a");
    assert.strictEqual(col.at(1).get("name"), "c");

    sinon.stub(col, "fetch");

    col.getFirstPage({fetch: true});
    assert.ok(col.fetch.calledOnce);
  });

  QUnit.test("getPreviousPage", function (assert) {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.getNextPage();
    col.getPreviousPage();
    assert.strictEqual(col.size(), 2);
    assert.strictEqual(col.at(0).get("name"), "a");
    assert.strictEqual(col.at(1).get("name"), "c");

    sinon.stub(col, "fetch");

    col.getNextPage();
    col.getPreviousPage({fetch: true});
    assert.ok(col.fetch.calledOnce);
  });

  QUnit.test("getNextPage", function (assert) {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.getNextPage();
    assert.strictEqual(col.size(), 1);
    assert.strictEqual(col.at(0).get("name"), "b");

    sinon.stub(col, "fetch");

    col.getPreviousPage();
    col.getNextPage({fetch: true});
    assert.ok(col.fetch.calledOnce);
  });

  QUnit.test("getLastPage", function (assert) {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.getLastPage();
    assert.strictEqual(col.size(), 1);
    assert.strictEqual(col.at(0).get("name"), "b");

    sinon.stub(col, "fetch");

    col.getLastPage({fetch: true});
    assert.ok(col.fetch.calledOnce);
  });

  QUnit.test("setPageSize", function (assert) {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    // decrease page size
    col.setPageSize(1);

    assert.strictEqual(col.state.pageSize, 1);
    assert.strictEqual(col.state.totalPages, 3);
    assert.strictEqual(col.state.lastPage, 3);
    assert.strictEqual(col.state.currentPage, 1);
    assert.strictEqual(col.length, 1);
    assert.strictEqual(col.fullCollection.length, 3);

    // increase page size
    col.setPageSize(3);

    assert.strictEqual(col.state.pageSize, 3);
    assert.strictEqual(col.state.totalPages, 1);
    assert.strictEqual(col.state.lastPage, 1);
    assert.strictEqual(col.state.currentPage, 1);
    assert.strictEqual(col.length, 3);
    assert.strictEqual(col.fullCollection.length, 3);

    col = new Backbone.PageableCollection(null, {
      state: {
        pageSize: 2
      },
      mode: "client"
    });

    col.setPageSize(1);

    assert.strictEqual(col.state.pageSize, 1);
    assert.strictEqual(col.state.totalPages, 0);
    assert.strictEqual(col.state.lastPage, null);
    assert.strictEqual(col.state.currentPage, 1);

    col.setPageSize(3);

    assert.strictEqual(col.state.pageSize, 3);
    assert.strictEqual(col.state.totalPages, 0);
    assert.strictEqual(col.state.lastPage, null);
    assert.strictEqual(col.state.currentPage, 1);

    // test again for 0-base page indices
    col = new Backbone.PageableCollection(models, {
      state: {
        firstPage: 0,
        pageSize: 2
      },
      mode: "client"
    });

    col.setPageSize(3);

    assert.strictEqual(col.state.pageSize, 3);
    assert.strictEqual(col.state.totalPages, 1);
    assert.strictEqual(col.state.lastPage, 0);
    assert.strictEqual(col.state.currentPage, 0);
    assert.strictEqual(col.length, 3);
    assert.strictEqual(col.fullCollection.length, 3);

    col.setPageSize(1);

    assert.strictEqual(col.state.pageSize, 1);
    assert.strictEqual(col.state.totalPages, 3);
    assert.strictEqual(col.state.lastPage, 2);
    assert.strictEqual(col.state.currentPage, 0);
    assert.strictEqual(col.length, 1);
    assert.strictEqual(col.fullCollection.length, 3);
  });

  QUnit.test("issue #15", function (assert) {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2,
        currentPage: 2
      },
      mode: "client"
    });

    col.fullCollection.remove(col.fullCollection.last());
    assert.strictEqual(col.state.currentPage, 1);
    assert.strictEqual(col.state.totalRecords, 2);
    assert.strictEqual(col.state.lastPage, 1);
    assert.strictEqual(col.state.totalPages, 1);
  });

  QUnit.test("hasNextPage and hasPreviousPage", function (assert) {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 1
      },
      mode: "client"
    });

    assert.strictEqual(col.hasPreviousPage(), false);
    assert.strictEqual(col.hasNextPage(), true);

    col.getNextPage();

    assert.strictEqual(col.hasPreviousPage(), true);
    assert.strictEqual(col.hasNextPage(), true);

    col.getLastPage();

    assert.strictEqual(col.hasPreviousPage(), true);
    assert.strictEqual(col.hasNextPage(), false);
  });

  QUnit.test("parsing from constructor #112", function (assert) {
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
    assert.deepEqual(col.toJSON(), [{"value": 1}, {"value": 2}]);
    assert.deepEqual(col.fullCollection.toJSON(), [{"value": 1}, {"value": 2}, {"value": 3}]);
  });

   QUnit.test("issue #309", function (assert) {
    var col = new Backbone.PageableCollection(models, {
      state: {
        pageSize: 2,
        currentPage: 2
      },
      mode: "client"
    });

    assert.strictEqual(col.state.totalRecords, 3);
    assert.strictEqual(col.state.lastPage, 2);
    assert.strictEqual(col.state.totalPages, 2);
    assert.strictEqual(col.state.currentPage, 2);
    assert.strictEqual(col.at(0).get("name"), "b");
    col.fullCollection.reset(models);
    assert.strictEqual(col.state.currentPage, 1);
    assert.strictEqual(col.at(0).get("name"), "a");
   });

  QUnit.test("issue #340 totalRecords should not take into account of dupe models under client mode", function(assert) {
    var col = new Backbone.PageableCollection([{id: 1}, {id: 1}], {mode: "client"});
    assert.strictEqual(col.state.totalRecords, 1);
  });

  QUnit.test("issue #345 setting sortKey to null should remove the query param from appearing in the query string", function (assert) {
    var col = new (Backbone.PageableCollection.extend({
      url: "test-client-fetch",
    }))([], {

      state: {
        sortKey: "column"
      },

      queryParams: {
        hello: null,
        sortKey: null
      },

      mode: "client"
    });

    col.fetch();

    var request = this.requests.shift();
    assert.equal(request.url, 'test-client-fetch');
  });

});
