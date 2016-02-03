$(document).ready(function () {

  "use strict";

  // TODO: test invalid state

  module("Backbone.PageableCollection - Server");

  test("parse", function () {
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
    }, "`pageSize` must be >= 1");

    state.pageSize = 1;
    col._checkState(state);

    state.totalPages = null;
    state.totalRecords = 2;
    state.pageSize = 1;
    col._checkState(state);
    strictEqual(state.totalPages, 2);

    state.totalPages = 100;
    col._checkState(state);
    strictEqual(state.totalPages, 2);

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

    state.firstPage = 0;
    state.currentPage = 0;
    state.totalRecords = 0;
    col._checkState(state);
    strictEqual(state.lastPage, 0);

    state.firstPage = 1;
    state.currentPage = 1;
    state.totalRecords = 0;
    col._checkState(state);
    strictEqual(state.lastPage, 1);
  });

  test("extend and constructor", function () {

    // test extending state and query params merge with defaults in prototype too
    var col = new (Backbone.PageableCollection.extend({
      state: {
        pageSize: 1
      },
      queryParams: {
        sortKey: "order_by"
      }
    }))();

    deepEqual(col.state, {
      firstPage: 1,
      lastPage: null,
      currentPage: 1,
      pageSize: 1,
      totalPages: null,
      totalRecords: null,
      sortKey: null,
      order: -1
    });

    deepEqual(col.queryParams, {
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
    strictEqual(col.state.lastPage, 2);
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

    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "c");
    strictEqual(col.at(2).get("name"), "b");

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

    strictEqual(col.at(0).get("name"), "a");
    strictEqual(col.at(1).get("name"), "b");
    strictEqual(col.at(2).get("name"), "c");
    strictEqual(col.comparator, comparator);
  });

  test("fetch", 17, function () {
    var col = new (Backbone.PageableCollection.extend({
      url: function () { return "test-fetch"; }
    }))();

    col.fetch();

    strictEqual(this.ajaxSettings.url, "test-fetch");
    deepEqual(this.ajaxSettings.data, {
      page: 1,
      "per_page": 25
    });

    col.queryParams.order = function () { return 'order_test'; };
    col.state.sortKey = "title",
    col.fetch();
    deepEqual(this.ajaxSettings.data, {
      page: 1,
      "sort_by": "title",
      "order_test": 'asc',
      "per_page": 25
    });


    col.state.sortKey = "name",
    col.state.totalRecords = 50;
    col.state.totalPages = 1;
    col.state.order = null;
    col.state.currentPage = 0;
    col.state.pageSize = 50;
    col.state.firstPage = 0;
    col.queryParams.access_token = function () { return this.state.currentPage + 1; };
    col.queryParams.query = null;

    col.fetch({url: function () { return "test-fetch-2"; }, add: true, silent: true});

    strictEqual(this.ajaxSettings.url, "test-fetch-2");
    strictEqual(this.ajaxSettings.add, true);
    strictEqual(this.ajaxSettings.silent, true);
    deepEqual(this.ajaxSettings.data, {
      page: 0,
      "per_page": 50,
      "sort_by": "name",
      "total_entries": 50,
      "total_pages": 1,
      "access_token": 1
    });


    this.ajaxSettings.success([{"total_entries": 0}, []]);
    strictEqual(col.state.sortKey, "name");
    strictEqual(col.state.firstPage, 0);
    strictEqual(col.state.order, null);
    strictEqual(col.state.currentPage, 0);
    strictEqual(col.state.pageSize, 50);
    strictEqual(col.state.totalRecords, 0);
    strictEqual(col.state.lastPage, 0);
    strictEqual(col.state.totalPages, 0);

    col.state.sortKey = ["firstSort", "secondSort"];
    col.state.order = [-1, 1];
    col.state.totalRecords = 50;
    col.state.totalPages = 1;
    col.state.currentPage = 0;
    col.state.pageSize = 50;
    col.state.firstPage = 0;
    col.fetch();
    deepEqual(this.ajaxSettings.data, {
      page: 0,
      "per_page": 50,
      "sort_by": ["firstSort", "secondSort"],
      "order_test": ["asc", "desc"],
      "total_entries": 50,
      "total_pages": 1,
      "access_token": 1
    });

    col.state.page = 0;
    col.fetch({data: {page: 1}});
    deepEqual(this.ajaxSettings.data.page, 1);
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

    sinon.stub(col, "fetch");

    col.getPage(2, {add: true, silent: true});
    strictEqual(col.state.currentPage, 2);
    deepEqual(col.fetch.args[0][0], {add: true, silent: true, from: 1, to: 2});

    col.fetch.restore();
  });

  test("getFirstPage", function () {
    var col = new Backbone.PageableCollection(null, {
      state: {
        totalRecords: 100,
        currentPage: 2
      }
    });

    sinon.stub(col, "fetch");

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

    sinon.stub(col, "fetch");

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

    sinon.stub(col, "fetch");

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

    sinon.stub(col, "fetch");

    col.getLastPage();

    strictEqual(col.state.currentPage, 4);
    ok(col.fetch.calledOnce);

    col.fetch.restore();
  });

  test("setPageSize", function () {
    var col = new Backbone.PageableCollection(null, {
      state: {
        totalRecords: 100,
        currentPage: 4
      }
    });
    col.url = "test";

    col.setPageSize(50);
    strictEqual(col.state.pageSize, 50);
    strictEqual(col.state.totalPages, 2);
    strictEqual(col.state.currentPage, 2);
    strictEqual(col.state.lastPage, 2);

    col.setPageSize(50, {first: true});
    strictEqual(col.state.pageSize, 50);
    strictEqual(col.state.totalPages, 2);
    strictEqual(col.state.currentPage, 1);
    strictEqual(col.state.lastPage, 2);

    throws(function() {
      col.setPageSize(Infinity);
    }, "`pageSize` must be a finite integer");
    strictEqual(col.state.pageSize, 50);

    throws(function() {
      col.setPageSize("foo");
    }, "`pageSize` must be a finite integer");
    strictEqual(col.state.pageSize, 50);

    col.setPageSize(25, {add: true, silent: true});
    strictEqual(col.state.pageSize, 25);
    strictEqual(col.state.totalPages, 4);
    strictEqual(col.state.lastPage, 4);
  });

  test("issue 298", function () {
    var col = new Backbone.PageableCollection();
    col.url = "test?a=";
    col.fetch();

    strictEqual(this.ajaxSettings.url, "test");
    deepEqual(this.ajaxSettings.data, {
      page: 1,
      "per_page": 25,
      a: ''
    });

  });

});
