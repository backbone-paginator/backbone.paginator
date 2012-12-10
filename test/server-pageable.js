$(document).ready(function () {

  // TODO: test invalid state

  module("Backbone.PageableCollection - Server");

  test("makeComparator", function () {
    var col, comparator;

    col = new Backbone.PageableCollection();
    comparator = col.makeComparator();
    equal(comparator, undefined);

    col.state.sortKey = "name";
    col.state.order = 0;
    comparator = col.makeComparator();
    equal(comparator, undefined);

    col = col.reset([{name: "b"}, {name: "c"}, {name: "a"}, {name: "a"}]);
    col.state.order = -1;
    col.comparator = col.makeComparator();
    col.sort();
    deepEqual(col.pluck("name"), ["a", "a", "b", "c"]);

    col.state.order = 1;
    col.comparator = col.makeComparator();
    col.sort();
    deepEqual(col.pluck("name"), ["c", "b", "a", "a"]);

    delete col.state.sortKey;
    delete col.state.order;
    col.comparator = col.makeComparator("name", -1);
    col.sort();
    deepEqual(col.pluck("name"), ["a", "a", "b", "c"]);
  });

  test("parse", function () {
    var resp = [{"page": 1,
                 "per_page": 2,
                 "total_pages": 2,
                 "total": 4,
                 "sort_by": "name",
                 "order": "DESC"},
                [{"name": "b"},
                 {"name": "c"},
                 {"name": "a"},
                 {"name": "a"}]];
    var col = new Backbone.PageableCollection();
    var models = col.parse(resp);
    deepEqual(models, [{"name": "b"},
                       {"name": "c"},
                       {"name": "a"},
                       {"name": "a"}]);
    strictEqual(col.state.currentPage, 1);
    strictEqual(col.state.pageSize, 2);
    strictEqual(col.state.totalPages, 2);
    strictEqual(col.state.totalRecords, 4);
    strictEqual(col.state.sortKey, "name");
    strictEqual(col.state.order, 1);

    resp  = [{"name": "a"},
             {"name": "a"},
             {"name": "b"},
             {"name": "c"}];

    models = col.parse(resp);
    deepEqual(models, [{"name": "a"},
                       {"name": "a"},
                       {"name": "b"},
                       {"name": "c"}]);
    strictEqual(col.state.currentPage, 1);
    strictEqual(col.state.pageSize, 2);
    strictEqual(col.state.totalPages, 2);
    strictEqual(col.state.totalRecords, 4);
    strictEqual(col.state.sortKey, "name");
    strictEqual(col.state.order, 1);
  });

  test("_checkState", function () {
    var col = new Backbone.PageableCollection();
    var state = _.clone(col.state);

    state.totalRecords = "";
    throws(function () {
      col._checkState(state);
    }, "`totalRecords` must be a number");

    state.totalRecords = 0;
    state.pageSize = "";
    throws(function () {
      col._checkState(state);
    }, "`pageSize` must be a number");

    state.totalPages = 0;
    state.currentPage = "";
    throws(function () {
      col._checkState(state);
    }, "`currentPage` must be a number");

    state.currentPage = 0;
    state.firstPage = "";
    throws(function () {
      col._checkState(state);
    }, "`firstPage` must be a number");

    state.firstPage = 0;
    state.pageSize = -1;
    throws(function () {
      col._checkState(state);
    }, "`pageSize` must be 1 <= pageSize <= totalRecords");

    state.pageSize = 1;
    throws(function () {
      col._checkState(state);
    }, "`pageSize` must be 1 <= pageSize <= totalRecords");

    state.totalPages = null;
    state.totalRecords = 2;
    state.pageSize = 1;
    col._checkState(state);
    strictEqual(state.totalPages, 2);

    state.totalPages = 100;
    col._checkState(state);
    strictEqual(state.totalPages, 100);

    state.totalPages = 2;
    state.firstPage = -1;
    throws(function () {
      col._checkState(state);
    }, "`firstPage must be 0 or 1`");

    state.firstPage = 0;
    state.currentPage = -1;
    throws(function () {
      col._checkState(state);
    }, "`currentPage` must be firstPage <= currentPage < totalPages if 0-based.");

    state.currentPage = 2;
    throws(function () {
      col._checkState(state);
    }, "`currentPage` must be firstPage <= currentPage < totalPages if 0-based.");

    state.currentPage = 0;
    col._checkState(state);
    strictEqual(state.lastPage, 1);

    state.firstPage = 1;
    throws(function () {
      col._checkState(state);
    }, "`currentPage` must be firstPage <= currentPage <= totalPages if 1-based.");

    state.currentPage = 3;
    throws(function () {
      col._checkState(state);
    }, "`currentPage` must be firstPage <= currentPage <= totalPages if 1-based.");

    state.currentPage = 1;
    col._checkState(state);
    strictEqual(state.lastPage, 2);
  });

  test("initialize", function () {
    var col = new Backbone.PageableCollection([
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

    strictEqual(col.state.firstPage, 0);
    strictEqual(col.state.currentPage, 0);
    strictEqual(col.state.pageSize, 1);
    strictEqual(col.state.totalPages, 3);
    strictEqual(col.state.totalRecords, 3);
    strictEqual(col.state.sortKey, "name");
    strictEqual(col.state.order, 1);
    strictEqual(col.comparator, undefined);

    strictEqual(col.queryParams.currentPage, "current_page");
    strictEqual(col.queryParams.pageSize, "page_size");
    strictEqual(col.queryParams.totalPages, "total_pages");
    strictEqual(col.queryParams.totalRecords, "total_records");
    strictEqual(col.queryParams.sortKey, "sort_key");
    strictEqual(col.queryParams.order, "direction");
    deepEqual(col.queryParams.directions, {"-1": -1, "1": 1});

    equal(col.at(0).get("name"), "a");
    equal(col.at(1).get("name"), "c");
    equal(col.at(2).get("name"), "b");

    var comparator = function (model) {
      return model.get("name");
    };

    col = new Backbone.PageableCollection([
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

    equal(col.at(0).get("name"), "a");
    equal(col.at(1).get("name"), "b");
    equal(col.at(2).get("name"), "c");
    strictEqual(col.comparator, comparator);
  });

  test("fetch", function () {

    this.stub(jQuery, "ajax");

    var col = new (Backbone.PageableCollection.extend({
      url: "test-fetch",
      model: Backbone.Model
    }))();

    col.fetch();

    strictEqual(jQuery.ajax.callCount, 1);
    strictEqual(jQuery.ajax.args[0][0].url, "test-fetch");
    deepEqual(jQuery.ajax.args[0][0].data, {
      order: "ASC",
      page: 1,
      per_page: 25
    });

    jQuery.ajax.reset();

    col.state.sortKey = "name",
    col.state.totalRecords = 50;
    col.state.totalPages = 1;
    col.state.order = null;
    col.state.currentPage = 0;
    col.state.pageSize = 50;
    col.state.firstPage = 0;

    col.fetch({add: true, silent: true});

    strictEqual(jQuery.ajax.callCount, 1);
    strictEqual(jQuery.ajax.args[0][0].url, "test-fetch");
    strictEqual(jQuery.ajax.args[0][0].add, true);
    strictEqual(jQuery.ajax.args[0][0].silent, true);
    deepEqual(jQuery.ajax.args[0][0].data, {
      page: 0,
      per_page: 50,
      sort_by: "name",
      total: 50,
      total_pages: 1
    });

    jQuery.ajax.restore();
  });

  test("getPage", function () {
    var col = new Backbone.PageableCollection(null, {
      state: {
        totalRecords: 100
      }
    });
    throws(function () {
      col.getPage('0');
    }, "`index` must be a finite integer");

    throws(function () {
      col.getPage(0);
    }, "`index` must be firstPage <= index <= lastPage");

    throws(function () {
      col.getPage(5);
    }, "`index` must be firstPage <= index <= lastPage");

    this.stub(col, "fetch");

    col.getPage(2, {add: true, silent: true});
    strictEqual(col.state.currentPage, 2);
    deepEqual(col.fetch.args[0][0], {add: true, silent: true});

    col.fetch.restore();
  });

  test("getFirstPage", function () {
    var col = new Backbone.PageableCollection(null, {
      state: {
        totalRecords: 100,
        currentPage: 2
      }
    });

    this.stub(col, "fetch");

    col.getFirstPage();

    strictEqual(col.state.currentPage, 1);
    ok(col.fetch.calledOnce);

    col.fetch.restore();
  });

  test("getPreviousPage", function () {
    var col = new Backbone.PageableCollection(null, {
      state: {
        totalRecords: 100,
        currentPage: 2
      }
    });

    this.stub(col, "fetch");

    col.getPreviousPage();

    strictEqual(col.state.currentPage, 1);
    ok(col.fetch.calledOnce);
    col.fetch.reset();

    throws(function () {
      col.getPreviousPage();
    }, "`index` must be firstPage <= index <= lastPage");

    col.fetch.restore();
  });

  test("getNextPage", function () {
    var col = new Backbone.PageableCollection(null, {
      state: {
        totalRecords: 100,
        currentPage: 3
      }
    });

    this.stub(col, "fetch");

    col.getNextPage();

    strictEqual(col.state.currentPage, 4);
    ok(col.fetch.calledOnce);
    col.fetch.reset();

    throws(function () {
      col.getNextPage();
    }, "`index` must be firstPage <= index <= lastPage");

    col.fetch.restore();
  });

  test("getLastPage", function () {
    var col = new Backbone.PageableCollection(null, {
      state: {
        totalRecords: 100,
        currentPage: 2
      }
    });

    this.stub(col, "fetch");

    col.getLastPage();

    strictEqual(col.state.currentPage, 4);
    ok(col.fetch.calledOnce);

    col.fetch.restore();
  });

  test("setPageSize", function () {
    var col = new Backbone.PageableCollection(null, {
      state: {
        totalRecords: 100
      }
    });

    throws(function () {
      col.setPageSize("50");
    }, "`pageSize` must be a finite integer");

    strictEqual(col.state.pageSize, 25);

    this.stub(col, "getPage");

    throws(function () {
      col.setPageSize(200);
    }, "`pageSize` must be 1 <= pageSize <= totalRecords");

    strictEqual(col.state.pageSize, 25);

    col.setPageSize(50, {add: true, silent: true});
    strictEqual(col.state.pageSize, 50);
    strictEqual(col.state.totalPages, 2);
    strictEqual(col.state.lastPage, 2);

    ok(col.getPage.calledOnce);
    strictEqual(col.getPage.args[0][0], 1);
    deepEqual(col.getPage.args[0][1], {
      add: true,
      silent: true
    });

    col.getPage.restore();
  });

});
