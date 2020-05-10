import _ from "underscore";
import PageableCollection from "../src/backbone.paginator";

// TODO: test invalid state

QUnit.module("Backbone.PageableCollection - Server", {
  beforeEach: function () {
    this.mockXHR.install(this);
  },

  afterEach: function () {
    this.mockXHR.uninstall(this);
  }
});

QUnit.test("parse", function (assert) {
  var resp = [{"page": 1,
    "per_page": 2,
    "total_pages": 2,
    "total_entries": 4,
    "sort_by": "name",
    "order": "desc"},
  [{"name": "b"},
    {"name": "c"},
    {"name": "a"},
    {"name": "a"}]];
  var col = new PageableCollection();
  sinon.spy(col, "trigger");

  var models = col.parse(resp);
  assert.deepEqual(models, [{"name": "b"},
    {"name": "c"},
    {"name": "a"},
    {"name": "a"}]);
  assert.strictEqual(col.state.currentPage, 1);
  assert.strictEqual(col.state.pageSize, 2);
  assert.strictEqual(col.state.totalPages, 2);
  assert.strictEqual(col.state.totalRecords, 4);
  assert.strictEqual(col.state.sortKey, "name");
  assert.strictEqual(col.state.order, 1);
  assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

  resp = [{"name": "a"},
    {"name": "a"},
    {"name": "b"},
    {"name": "c"}];

  models = col.parse(resp);
  assert.deepEqual(models, [{"name": "a"},
    {"name": "a"},
    {"name": "b"},
    {"name": "c"}]);
  assert.strictEqual(col.state.currentPage, 1);
  assert.strictEqual(col.state.pageSize, 2);
  assert.strictEqual(col.state.totalPages, 2);
  assert.strictEqual(col.state.totalRecords, 4);
  assert.strictEqual(col.state.sortKey, "name");
  assert.strictEqual(col.state.order, 1);
  assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

  resp = [{total_entries: 6}, [{"name": "a"},
    {"name": "a"},
    {"name": "b"},
    {"name": "c"}]];

  models = col.parse(resp);
  assert.deepEqual(models, [{"name": "a"},
    {"name": "a"},
    {"name": "b"},
    {"name": "c"}]);
  assert.strictEqual(col.state.currentPage, 1);
  assert.strictEqual(col.state.pageSize, 2);
  assert.strictEqual(col.state.totalPages, 3);
  assert.strictEqual(col.state.totalRecords, 6);
  assert.strictEqual(col.state.sortKey, "name");
  assert.strictEqual(col.state.order, 1);
  assert.ok(col.trigger.calledWith("pageable:state:change", col.state));
});

QUnit.test("_checkState", function (assert) {
  var col = new PageableCollection();
  var state = _.clone(col.state);

  state.totalRecords = "";
  assert.throws(function () {
    col._checkState(state);
  }, "`totalRecords` must be a number");

  state.totalRecords = 0;
  state.pageSize = "";
  assert.throws(function () {
    col._checkState(state);
  }, "`pageSize` must be a number");

  state.totalPages = 0;
  state.currentPage = "";
  assert.throws(function () {
    col._checkState(state);
  }, "`currentPage` must be a number");

  state.currentPage = 0;
  state.firstPage = "";
  assert.throws(function () {
    col._checkState(state);
  }, "`firstPage` must be a number");

  state.firstPage = 0;
  state.pageSize = -1;
  assert.throws(function () {
    col._checkState(state);
  }, "`pageSize` must be >= 1");

  state.pageSize = 1;
  col._checkState(state);

  state.totalPages = null;
  state.totalRecords = 2;
  state.pageSize = 1;
  col._checkState(state);
  assert.strictEqual(state.totalPages, 2);

  state.totalPages = 100;
  col._checkState(state);
  assert.strictEqual(state.totalPages, 2);

  state.totalPages = 2;
  state.firstPage = -1;
  assert.throws(function () {
    col._checkState(state);
  }, "`firstPage must be 0 or 1`");

  state.firstPage = 0;
  state.currentPage = -1;
  assert.throws(function () {
    col._checkState(state);
  }, "`currentPage` must be firstPage <= currentPage < totalPages if 0-based.");

  state.currentPage = 2;
  assert.throws(function () {
    col._checkState(state);
  }, "`currentPage` must be firstPage <= currentPage < totalPages if 0-based.");

  state.currentPage = 0;
  col._checkState(state);
  assert.strictEqual(state.lastPage, 1);

  state.firstPage = 1;
  assert.throws(function () {
    col._checkState(state);
  }, "`currentPage` must be firstPage <= currentPage <= totalPages if 1-based.");

  state.currentPage = 3;
  assert.throws(function () {
    col._checkState(state);
  }, "`currentPage` must be firstPage <= currentPage <= totalPages if 1-based.");

  state.currentPage = 1;
  col._checkState(state);
  assert.strictEqual(state.lastPage, 2);

  state.firstPage = 0;
  state.currentPage = 0;
  state.totalRecords = 0;
  col._checkState(state);
  assert.strictEqual(state.lastPage, 0);

  state.firstPage = 1;
  state.currentPage = 1;
  state.totalRecords = 0;
  col._checkState(state);
  assert.strictEqual(state.lastPage, 1);
});

QUnit.test("extend and constructor", function (assert) {

  // test extending state and query params merge with defaults in prototype too
  var col = new (PageableCollection.extend({
    state: {
      pageSize: 1
    },
    queryParams: {
      sortKey: "order_by"
    }
  }))();

  assert.deepEqual(col.state, {
    firstPage: 1,
    lastPage: null,
    currentPage: 1,
    pageSize: 1,
    totalPages: null,
    totalRecords: null,
    sortKey: null,
    order: -1
  });

  assert.deepEqual(col.queryParams, {
    currentPage: "page",
    pageSize: "per_page",
    totalPages: "total_pages",
    totalRecords: "total_entries",
    sortKey: "order_by",
    order: "order",
    directions: {
      "-1": "asc",
      "1": "desc"
    }
  });

  col = new PageableCollection([
    {"name": "a"},
    {"name": "c"},
    {"name": "b"}
  ], {
    state: {
      firstPage: 0,
      currentPage: 0,
      pageSize: 1,
      totalPages: 3,
      totalRecords: 3,
      sortKey: "name",
      order: 1
    },
    queryParams: {
      currentPage: "current_page",
      pageSize: "page_size",
      totalPages: "total_pages",
      totalRecords: "total_records",
      sortKey: "sort_key",
      order: "direction",
      directions: {"-1": -1, "1": 1}
    }
  });

  assert.strictEqual(col.state.firstPage, 0);
  assert.strictEqual(col.state.currentPage, 0);
  assert.strictEqual(col.state.pageSize, 1);
  assert.strictEqual(col.state.lastPage, 2);
  assert.strictEqual(col.state.totalPages, 3);
  assert.strictEqual(col.state.totalRecords, 3);
  assert.strictEqual(col.state.sortKey, "name");
  assert.strictEqual(col.state.order, 1);
  assert.strictEqual(col.comparator, undefined);

  assert.strictEqual(col.queryParams.currentPage, "current_page");
  assert.strictEqual(col.queryParams.pageSize, "page_size");
  assert.strictEqual(col.queryParams.totalPages, "total_pages");
  assert.strictEqual(col.queryParams.totalRecords, "total_records");
  assert.strictEqual(col.queryParams.sortKey, "sort_key");
  assert.strictEqual(col.queryParams.order, "direction");
  assert.deepEqual(col.queryParams.directions, {"-1": -1, "1": 1});

  assert.strictEqual(col.at(0).get("name"), "a");
  assert.strictEqual(col.at(1).get("name"), "c");
  assert.strictEqual(col.at(2).get("name"), "b");

  var comparator = function (model) {
    return model.get("name");
  };

  col = new PageableCollection([
    {"name": "a"},
    {"name": "c"},
    {"name": "b"}
  ], {
    state: {
      firstPage: 0,
      currentPage: 0,
      pageSize: 1,
      totalPages: 3,
      totalRecords: 3,
      sortKey: "name",
      order: 1
    },
    comparator: comparator
  });

  assert.strictEqual(col.at(0).get("name"), "a");
  assert.strictEqual(col.at(1).get("name"), "b");
  assert.strictEqual(col.at(2).get("name"), "c");
  assert.strictEqual(col.comparator, comparator);
});

QUnit.test("fetch", function (assert) {
  assert.expect(13);

  var col = new (PageableCollection.extend({
    url: function () {return "test-fetch";}
  }))();

  col.fetch();

  assert.strictEqual(this.requests.shift().url, "test-fetch?page=1&per_page=25");

  col.queryParams.order = function () {return "order_test";};
  col.state.sortKey = "title";
  col.fetch();
  assert.deepEqual(this.requests.shift().url, "test-fetch?page=1&per_page=25&sort_by=title&order_test=asc");

  col.state.sortKey = "name";
  col.state.totalRecords = 50;
  col.state.totalPages = 1;
  col.state.order = null;
  col.state.currentPage = 0;
  col.state.pageSize = 50;
  col.state.firstPage = 0;
  col.queryParams.access_token = function () {return this.state.currentPage + 1;};
  col.queryParams.query = null;

  col.fetch({url: function () {return "test-fetch-2";}, add: true, silent: true});

  var request = this.requests.shift();
  assert.strictEqual(request.url, "test-fetch-2?page=0&per_page=50&sort_by=name&access_token=1");

  request.respond(200, {}, JSON.stringify([
    {
      "total_entries": 0
    },
    []
  ]));
  assert.strictEqual(col.state.sortKey, "name");
  assert.strictEqual(col.state.firstPage, 0);
  assert.strictEqual(col.state.order, null);
  assert.strictEqual(col.state.currentPage, 0);
  assert.strictEqual(col.state.pageSize, 50);
  assert.strictEqual(col.state.totalRecords, 0);
  assert.strictEqual(col.state.lastPage, 0);
  assert.strictEqual(col.state.totalPages, 0);

  col.state.sortKey = ["firstSort", "secondSort"];
  col.state.order = [-1, 1];
  col.state.totalRecords = 50;
  col.state.totalPages = 1;
  col.state.currentPage = 0;
  col.state.pageSize = 50;
  col.state.firstPage = 0;
  col.fetch();
  assert.deepEqual(
      this.requests.shift().url,
      "test-fetch?page=0&per_page=50&sort_by%5B%5D=firstSort&sort_by%5B%5D=secondSort&order_test%5B%5D=asc&order_test%5B%5D=desc&access_token=1"
  );

  col.state.page = 0;
  col.fetch({data: {page: 1}});
  assert.deepEqual(this.requests.shift().url, "test-fetch?page=1&per_page=50&sort_by%5B%5D=firstSort&sort_by%5B%5D=secondSort&order_test%5B%5D=asc&order_test%5B%5D=desc&access_token=1");
});

QUnit.test("getPage", function (assert) {
  var col = new PageableCollection(null, {
    state: {
      totalRecords: 100
    }
  });
  assert.throws(function () {
    col.getPage("0");
  }, "`index` must be a finite integer");

  assert.throws(function () {
    col.getPage(0);
  }, "`index` must be firstPage <= index <= lastPage");

  assert.throws(function () {
    col.getPage(5);
  }, "`index` must be firstPage <= index <= lastPage");

  sinon.stub(col, "fetch");

  col.getPage(2, {add: true, silent: true});
  assert.strictEqual(col.state.currentPage, 2);
  assert.deepEqual(col.fetch.args[0][0], {add: true, silent: true, from: 1, to: 2});

  col.fetch.restore();
});

QUnit.test("getFirstPage", function (assert) {
  var col = new PageableCollection(null, {
    state: {
      totalRecords: 100,
      currentPage: 2
    }
  });

  sinon.stub(col, "fetch");

  col.getFirstPage();

  assert.strictEqual(col.state.currentPage, 1);
  assert.ok(col.fetch.calledOnce);

  col.fetch.restore();
});

QUnit.test("getPreviousPage", function (assert) {
  var col = new PageableCollection(null, {
    state: {
      totalRecords: 100,
      currentPage: 2
    }
  });

  sinon.stub(col, "fetch");

  col.getPreviousPage();

  assert.strictEqual(col.state.currentPage, 1);
  assert.ok(col.fetch.calledOnce);
  col.fetch.resetHistory();

  assert.throws(function () {
    col.getPreviousPage();
  }, "`index` must be firstPage <= index <= lastPage");

  col.fetch.restore();
});

QUnit.test("getNextPage", function (assert) {
  var col = new PageableCollection(null, {
    state: {
      totalRecords: 100,
      currentPage: 3
    }
  });

  sinon.stub(col, "fetch");

  col.getNextPage();

  assert.strictEqual(col.state.currentPage, 4);
  assert.ok(col.fetch.calledOnce);
  col.fetch.resetHistory();

  assert.throws(function () {
    col.getNextPage();
  }, "`index` must be firstPage <= index <= lastPage");

  col.fetch.restore();
});

QUnit.test("getLastPage", function (assert) {
  var col = new PageableCollection(null, {
    state: {
      totalRecords: 100,
      currentPage: 2
    }
  });

  sinon.stub(col, "fetch");

  col.getLastPage();

  assert.strictEqual(col.state.currentPage, 4);
  assert.ok(col.fetch.calledOnce);

  col.fetch.restore();
});

QUnit.test("setPageSize", function (assert) {
  var col = new PageableCollection(null, {
    state: {
      totalRecords: 100,
      currentPage: 4
    }
  });
  col.url = "test";

  col.setPageSize(50);
  assert.strictEqual(col.state.pageSize, 50);
  assert.strictEqual(col.state.totalPages, 2);
  assert.strictEqual(col.state.currentPage, 2);
  assert.strictEqual(col.state.lastPage, 2);

  col.setPageSize(50, {first: true});
  assert.strictEqual(col.state.pageSize, 50);
  assert.strictEqual(col.state.totalPages, 2);
  assert.strictEqual(col.state.currentPage, 1);
  assert.strictEqual(col.state.lastPage, 2);

  assert.throws(function () {
    col.setPageSize(Infinity);
  }, "`pageSize` must be a finite integer");
  assert.strictEqual(col.state.pageSize, 50);

  assert.throws(function () {
    col.setPageSize("foo");
  }, "`pageSize` must be a finite integer");
  assert.strictEqual(col.state.pageSize, 50);

  col.setPageSize(25, {add: true, silent: true});
  assert.strictEqual(col.state.pageSize, 25);
  assert.strictEqual(col.state.totalPages, 4);
  assert.strictEqual(col.state.lastPage, 4);
});

QUnit.test("issue 298", function (assert) {
  var col = new PageableCollection();
  col.url = "test?a=";
  col.fetch();

  assert.strictEqual(this.requests.shift().url, "test?a=&page=1&per_page=25");

});
