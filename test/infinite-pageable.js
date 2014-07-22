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

  test("constructor", function () {
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

    col = new (Backbone.PageableCollection.extend({
      url: "url"
    }))(null, {
      state: {
        firstPage: 0
      },
      mode: "infinite"
    });

    ok(col.links[0] === "url");
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

    xhr.getResponseHeader = function () {
      return null;
    };
    links = col.parseLinks({}, {xhr: xhr});
    deepEqual(links, {});
  });

  test("#237 url function is called with the right context", function () {
    var col = new (Backbone.PageableCollection.extend({
      name: "name",
      url: function () {
        return "/" + this.name;
      },
      mode: "infinite",
      parseLinks: function () {
        return {};
      }
    }));

    col.getFirstPage();

    strictEqual(this.ajaxSettings.url, "/name");

    this.ajaxSettings.success([{"total_entries": 1}, [{id: 1}]]);
  });

  test("fetch", 3, function () {
    var oldParse = col.parse;
    col.parse = function () {
      ok(true);
      return oldParse.apply(this, arguments);
    };

    col.parseLinks = function () {
      return {first: "url-1", next: "url-2"};
    };

    // makes sure collection events on the current page are not suppressed when
    // refetching the same page
    col.on("all", function (event) {
      if (!_.contains(["request", "sync", "reset"], event)) {
        ok(false);
      }
    });

    col.fetch();

    strictEqual(this.ajaxSettings.url, "url");
    deepEqual(this.ajaxSettings.data, {
      page: 2,
      "per_page": 2,
      "total_entries": 4,
      "total_pages": 2
    });

    this.ajaxSettings.success([
      {id: 1},
      {id: 3}
    ]);

    col.parse = oldParse;
  });

  test("get*Page", 53, function () {

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

    sinon.spy(col, "parse");
    sinon.stub(col, "parseLinks").returns({next: "url2", last: "lastUrl"});

    var currentPageResetEventCount = 0;
    col.on("reset", function () {
      currentPageResetEventCount++;
    });

    var fullCollectionAddEventCount = 0;
    col.fullCollection.on("add", function () {
      fullCollectionAddEventCount++;
    });

    var fullCollectionRemoveEventCount = 0;
    col.fullCollection.on("remove", function () {
      fullCollectionRemoveEventCount++;
    });

    var fullCollectionResetEventCount = 0;
    col.fullCollection.on("reset", function () {
      fullCollectionResetEventCount++;
    });

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
    this.ajaxSettings.success([
      {id: 2},
      {id: 1}
    ]);
    equal(currentPageResetEventCount, 1);
    equal(fullCollectionAddEventCount, 2);
    equal(fullCollectionRemoveEventCount, 0);
    equal(fullCollectionResetEventCount, 0);
    equal(col.parse.callCount, 1);
    currentPageResetEventCount = 0;
    fullCollectionAddEventCount = 0;
    fullCollectionRemoveEventCount = 0;
    fullCollectionResetEventCount = 0;
    col.parse.reset();
    col.parseLinks.reset();

    // test paging for a page that has a link but no models results in a fetch
    col.parseLinks.returns({next: "url3"});
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
    this.ajaxSettings.success([
      {id: 3},
      {id: 4}
    ]);
    equal(currentPageResetEventCount, 1);
    equal(fullCollectionAddEventCount, 2);
    equal(fullCollectionRemoveEventCount, 0);
    equal(fullCollectionResetEventCount, 0);
    equal(col.parse.callCount, 1);
    currentPageResetEventCount = 0;
    fullCollectionAddEventCount = 0;
    fullCollectionRemoveEventCount = 0;
    fullCollectionResetEventCount = 0;
    col.parse.reset();
    col.parseLinks.reset();

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
    equal(currentPageResetEventCount, 1);
    equal(fullCollectionAddEventCount, 0);
    equal(fullCollectionRemoveEventCount, 0);
    equal(fullCollectionResetEventCount, 0);
    currentPageResetEventCount = 0;

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
    equal(currentPageResetEventCount, 1);
    equal(fullCollectionAddEventCount, 0);
    equal(fullCollectionRemoveEventCount, 0);
    equal(fullCollectionResetEventCount, 0);

    col.parseLinks.restore();
  });

  test("hasNextPage and hasPreviousPage", function () {
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

    strictEqual(col.hasPreviousPage(), false);
    strictEqual(col.hasNextPage(), true);

    col.getNextPage();

    strictEqual(col.hasPreviousPage(), true);
    strictEqual(col.hasNextPage(), true);

    col.getLastPage();

    strictEqual(col.hasPreviousPage(), true);
    strictEqual(col.hasNextPage(), false);
  });

});
