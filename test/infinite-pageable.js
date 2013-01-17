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
    ok(col.url, "url");
    ok(col.mode, "infinite");
    ok(col.state.totalRecords === 4);
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

    ok(col.state.totalRecords === 100);
    ok(col.state.totalPages === 50);
    ok(col.state.lastPage === 50);
  });

  test("fetch", 2, function () {
    this.stub(Backbone.Collection.prototype, "fetch");
    col.fetch();
    ok(Backbone.Collection.prototype.fetch.calledOnce);
    ok(Backbone.Collection.prototype.fetch.args[0][0].url === "url");
    Backbone.Collection.prototype.fetch.restore();
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

    this.stub(col, "parseLinks").returns({next: "url2", last: "lastUrl"});

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
      ok(col.state.currentPage === col.state.firstPage);
      ok(col.state.totalRecords === 2);
      ok(col.state.totalPages === 1);
      ok(col.state.lastPage === 1);
      ok(col.fullCollection.length === 2);
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
      ok(col.state.currentPage === 2);
      ok(col.state.totalRecords === 4);
      ok(col.state.totalPages === 2);
      ok(col.state.lastPage === 2);
      ok(col.fullCollection.length === 4);
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
    ok(col.parseLinks.called === false);
    ok(col.state.currentPage === 1);
    ok(col.state.totalRecords === 4);
    ok(col.state.totalPages === 2);
    ok(col.state.lastPage === 2);
    ok(col.fullCollection.length === 4);
    deepEqual(col.links, {
      "1": "url",
      "2": "url2",
      "3": "url3"
    });
    deepEqual(col.toJSON(), [{id: 2}, {id: 1}]);
    deepEqual(col.fullCollection.toJSON(), [{id: 2}, {id: 1}, {id: 3}, {id: 4}]);

    // test paging to last page
    col.getLastPage();
    ok(col.parseLinks.called === false);
    ok(col.state.currentPage === 2);
    ok(col.state.totalRecords === 4);
    ok(col.state.totalPages === 2);
    ok(col.state.lastPage === 2);
    ok(col.fullCollection.length === 4);
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
    ok(col.state.currentPage === 2);
    ok(col.state.totalRecords === 4);
    ok(col.state.totalPages === 2);
    ok(col.state.lastPage === 2);
    ok(col.fullCollection.length === 4);
    deepEqual(col.links, {
      "1": "url",
      "2": "url2",
      "3": "url3"
    });
    deepEqual(col.toJSON(), [{id: 4}, {id: 5}]);
    deepEqual(col.fullCollection.toJSON(), [{id: 2}, {id: 1}, {id: 4}, {id: 5}]);

    $.ajax = ajax;
  });

});
