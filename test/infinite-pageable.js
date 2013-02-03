$(document).ready(function () {

  "use strict";

  var col;

  module("Backbone.PageableCollection - Infinite", {
    setup: function () {
      col = new (Backbone.PageableCollection.extend({
        url: "url"
      }))([
        {id: 1},
        {id: 3},
        {id: 2},
        {id: 4}
      ], {
        state: {
          pageSize: 2,
          currentPage: 2
        },
        mode: "infinite"
      });
    }
  });

  test("initialize", function () {
    ok(col.fullCollection instanceof Backbone.Collection);
    strictEqual(col.url, "url");
    strictEqual(col.mode, "infinite");
    strictEqual(col.state.totalRecords, 4);
    deepEqual(col.links, {
      "1": "url",
      "2": "url"
    });
    deepEqual(col.toJSON(), [{id: 2}, {id: 4}]);
    deepEqual(col.fullCollection.toJSON(), [{id: 1}, {id: 3}, {id: 2}, {id: 4}]);
  });

  test("parseLinks", function () {
    var xhr = {
      getResponseHeader: function (header) {
        if (header.toLowerCase() == "link") {
          return '<https://api.github.com/user/repos?page=3&per_page=2>; rel="next", <https://api.github.com/user/repos?page=50&per_page=2>; rel="last"';
        }
        return null;
      }
    };

    var links = col.parseLinks({}, {xhr: xhr});

    deepEqual(links, {
      next: "https://api.github.com/user/repos?page=3&per_page=2"
    });

    strictEqual(col.state.totalRecords, 100);
    strictEqual(col.state.totalPages, 50);
    strictEqual(col.state.lastPage, 50);
  });

  test("fetch", function () {
    var ajax = $.ajax;
    $.ajax = function (settings) {

      strictEqual(settings.url, "url");
      deepEqual(settings.data, {
        page: 2,
        "per_page": 2,
        "total_entries": 4,
        "total_pages": 2
      });

      settings.success([
        {id: 5},
        {id: 6}
      ]);
    };

    col.parseLinks = function () {
      return {first: "url-1", next: "url-2"};
    };

    // makes sure normal add, remove and sort events are suppressed
    col.on("all", function (event) {
      if (_.contains(["add", "remove", "sort"], event)) ok(false);
    });

    col.fetch();

    $.ajax = ajax;
  });

  test("get*Page", 43, function () {

    var col = new (Backbone.PageableCollection.extend({
      url: "url"
    }))(null, {
      state: {
        pageSize: 2
      },
      mode: "infinite"
    });

    throws(function () {
      col.getPage("nosuchpage");
    });

    sinon.stub(col, "parseLinks").returns({next: "url2", last: "lastUrl"});

    var ajax = $.ajax;
    $.ajax = function (settings) {
      settings.success([
        {id: 2},
        {id: 1}
      ]);
    };

    // test paging in the first page gets a page full of models and a link for
    // the next page
    col.getFirstPage({success: function () {
      strictEqual(col.state.currentPage, col.state.firstPage);
      strictEqual(col.state.totalRecords, 2);
      strictEqual(col.state.totalPages, 1);
      strictEqual(col.state.lastPage, 1);
      strictEqual(col.fullCollection.length, 2);
      deepEqual(col.links, {
        "1": "url",
        "2": "url2"
      });
      deepEqual(col.toJSON(), [{id: 2}, {id: 1}]);
      deepEqual(col.fullCollection.toJSON(), [{id: 2}, {id: 1}]);
    }});

    col.parseLinks.reset();

    col.parseLinks.returns({next: "url3"});
    $.ajax = function (settings) {
      settings.success([
        {id: 3},
        {id: 4}
      ]);
    };

    // test paging for a page that has a link but no models results in a fetch
    col.getNextPage({success: function () {
      strictEqual(col.state.currentPage, 2);
      strictEqual(col.state.totalRecords, 4);
      strictEqual(col.state.totalPages, 2);
      strictEqual(col.state.lastPage, 2);
      strictEqual(col.fullCollection.length, 4);
      deepEqual(col.links, {
        "1": "url",
        "2": "url2",
        "3": "url3"
      });
      deepEqual(col.toJSON(), [{id: 3}, {id: 4}]);
      deepEqual(col.fullCollection.toJSON(), [{id: 2}, {id: 1}, {id: 3}, {id: 4}]);
    }});

    col.parseLinks.reset();
    $.ajax = function () {
      ok(false, "ajax should not be called");
    };

    // test paging backward use cache
    col.getPreviousPage();
    strictEqual(col.parseLinks.called, false);
    strictEqual(col.state.currentPage, 1);
    strictEqual(col.state.totalRecords, 4);
    strictEqual(col.state.totalPages, 2);
    strictEqual(col.state.lastPage, 2);
    strictEqual(col.fullCollection.length, 4);
    deepEqual(col.links, {
      "1": "url",
      "2": "url2",
      "3": "url3"
    });
    deepEqual(col.toJSON(), [{id: 2}, {id: 1}]);
    deepEqual(col.fullCollection.toJSON(), [{id: 2}, {id: 1}, {id: 3}, {id: 4}]);

    // test paging to last page
    col.getLastPage();
    strictEqual(col.parseLinks.called, false);
    strictEqual(col.state.currentPage, 2);
    strictEqual(col.state.totalRecords, 4);
    strictEqual(col.state.totalPages, 2);
    strictEqual(col.state.lastPage, 2);
    strictEqual(col.fullCollection.length, 4);
    deepEqual(col.links, {
      "1": "url",
      "2": "url2",
      "3": "url3"
    });
    deepEqual(col.toJSON(), [{id: 3}, {id: 4}]);
    deepEqual(col.fullCollection.toJSON(), [{id: 2}, {id: 1}, {id: 3}, {id: 4}]);

    $.ajax = function (settings) {
      settings.success([
        {id: 4},
        {id: 5}
      ]);
    };

    // test force fetch update the current page under 0.9.9+ and resets otherwise
    col.getPage(col.state.currentPage, {fetch: true});
    strictEqual(col.state.currentPage, 2);
    strictEqual(col.state.totalRecords, 4);
    strictEqual(col.state.totalPages, 2);
    strictEqual(col.state.lastPage, 2);
    strictEqual(col.fullCollection.length, 4);
    deepEqual(col.links, {
      "1": "url",
      "2": "url2",
      "3": "url3"
    });
    deepEqual(col.toJSON(), [{id: 4}, {id: 5}]);
    deepEqual(col.fullCollection.toJSON(), [{id: 2}, {id: 1}, {id: 4}, {id: 5}]);

    col.parseLinks.restore();

    $.ajax = ajax;
  });

  test("hasNext and hasPrevious", function () {
    var col = new (Backbone.PageableCollection.extend({
      url: "url"
    }))([
      {id: 1},
      {id: 2},
      {id: 3}
    ], {
      state: {
        pageSize: 1
      },
      mode: "infinite"
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
