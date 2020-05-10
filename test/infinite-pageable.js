import _ from "underscore";
import Backbone from "backbone";
import PageableCollection from "../src/backbone.paginator";

var col;

QUnit.module("Backbone.PageableCollection - Infinite", {
  beforeEach: function () {
    col = new (PageableCollection.extend({
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

    this.mockXHR.install(this);
  },

  afterEach: function () {
    this.mockXHR.uninstall(this);
  }
});

QUnit.test("constructor", function (assert) {
  assert.ok(col.fullCollection instanceof Backbone.Collection);
  assert.strictEqual(col.url, "url");
  assert.strictEqual(col.mode, "infinite");
  assert.strictEqual(col.state.totalRecords, 4);
  assert.deepEqual(col.links, {
    "1": "url",
    "2": "url"
  });
  assert.deepEqual(col.toJSON(), [{id: 2}, {id: 4}]);
  assert.deepEqual(col.fullCollection.toJSON(), [{id: 1}, {id: 3}, {id: 2}, {id: 4}]);

  col = new (PageableCollection.extend({
    url: "url"
  }))(null, {
    state: {
      firstPage: 0
    },
    mode: "infinite"
  });

  assert.ok(col.links[0] === "url");
});

QUnit.test("parseLinks", function (assert) {
  var xhr = {
    getResponseHeader: function (header) {
      if (header.toLowerCase() == "link") {
        return '<https://api.github.com/user/repos?page=3&per_page=2>; rel="next", <https://api.github.com/user/repos?page=50&per_page=2>; rel="last"';
      }
      return null;
    }
  };

  var links = col.parseLinks({}, {xhr: xhr});

  assert.deepEqual(links, {
    next: "https://api.github.com/user/repos?page=3&per_page=2"
  });

  xhr.getResponseHeader = function () {
    return null;
  };
  links = col.parseLinks({}, {xhr: xhr});
  assert.deepEqual(links, {});
});

QUnit.test("#237 url function is called with the right context", function (assert) {
  var col = new (PageableCollection.extend({
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

  var request = this.requests.shift();
  assert.strictEqual(request.url, "/name?page=1&per_page=25");

  request.respond(200, {}, JSON.stringify([
    {
      "total_entries": 1
    },
    [
      {
        id: 1
      }
    ]
  ]));
});

QUnit.test("fetch", function (assert) {
  sinon.spy(col, "parse");

  col.parseLinks = function () {
    return {first: "url-1", next: "url-2"};
  };

  var shouldNotBeCalled = sinon.spy();
  var onAll = sinon.stub().callsFake(function (event) {
    if (!_.contains(["request", "sync", "reset", "pageable:state:change"], event)) {
      shouldNotBeCalled();
    }
  });

  // makes sure collection events on the current page are not suppressed when
  // refetching the same page
  col.on("all", onAll);

  col.fetch();

  var request = this.requests.shift();
  assert.strictEqual(request.url, "url?page=2&per_page=2");

  request.respond(200, {}, JSON.stringify([
    {id: 1},
    {id: 3}
  ]));

  assert.strictEqual(col.parse.callCount, 1);
  assert.strictEqual(shouldNotBeCalled.callCount, 0);
});

QUnit.test("get*Page", function (assert) {
  assert.expect(53);

  var col = new (PageableCollection.extend({
    url: "url"
  }))(null, {
    state: {
      pageSize: 2
    },
    mode: "infinite"
  });

  assert.throws(function () {
    col.getPage("nosuchpage");
  });

  sinon.spy(col, "parse");
  sinon.stub(col, "parseLinks").returns({next: "url2", last: "lastUrl"});

  var currentPageResetEventCount = sinon.spy();
  col.on("reset", currentPageResetEventCount);

  var fullCollectionAddEventCount = sinon.spy();
  col.fullCollection.on("add", fullCollectionAddEventCount);

  var fullCollectionRemoveEventCount = sinon.spy();
  col.fullCollection.on("remove", fullCollectionRemoveEventCount);

  var fullCollectionResetEventCount = sinon.spy();
  col.fullCollection.on("reset", fullCollectionResetEventCount);

  // test paging in the first page gets a page full of models and a link for
  // the next page
  col.getFirstPage({success: function () {
    assert.strictEqual(col.state.currentPage, col.state.firstPage);
    assert.strictEqual(col.state.totalRecords, 2);
    assert.strictEqual(col.state.totalPages, 1);
    assert.strictEqual(col.state.lastPage, 1);
    assert.strictEqual(col.fullCollection.length, 2);
    assert.deepEqual(col.links, {
      "1": "url",
      "2": "url2"
    });
    assert.deepEqual(col.toJSON(), [{id: 2}, {id: 1}]);
    assert.deepEqual(col.fullCollection.toJSON(), [{id: 2}, {id: 1}]);
  }});
  this.requests.shift().respond(200, {}, JSON.stringify([
    {id: 2},
    {id: 1}
  ]));
  assert.equal(currentPageResetEventCount.callCount, 1);
  assert.equal(fullCollectionAddEventCount.callCount, 2);
  assert.equal(fullCollectionRemoveEventCount.callCount, 0);
  assert.equal(fullCollectionResetEventCount.callCount, 0);
  assert.equal(col.parse.callCount, 1);
  currentPageResetEventCount.resetHistory();
  fullCollectionAddEventCount.resetHistory();
  fullCollectionRemoveEventCount.resetHistory();
  fullCollectionResetEventCount.resetHistory();
  col.parse.resetHistory();
  col.parseLinks.resetHistory();

  // test paging for a page that has a link but no models results in a fetch
  col.parseLinks.returns({next: "url3"});
  col.getNextPage({success: function () {
    assert.strictEqual(col.state.currentPage, 2);
    assert.strictEqual(col.state.totalRecords, 4);
    assert.strictEqual(col.state.totalPages, 2);
    assert.strictEqual(col.state.lastPage, 2);
    assert.strictEqual(col.fullCollection.length, 4);
    assert.deepEqual(col.links, {
      "1": "url",
      "2": "url2",
      "3": "url3"
    });
    assert.deepEqual(col.toJSON(), [{id: 3}, {id: 4}]);
    assert.deepEqual(col.fullCollection.toJSON(), [{id: 2}, {id: 1}, {id: 3}, {id: 4}]);
  }});
  this.requests.shift().respond(200, {}, JSON.stringify([
    {id: 3},
    {id: 4}
  ]));
  assert.equal(currentPageResetEventCount.callCount, 1);
  assert.equal(fullCollectionAddEventCount.callCount, 2);
  assert.equal(fullCollectionRemoveEventCount.callCount, 0);
  assert.equal(fullCollectionResetEventCount.callCount, 0);
  assert.equal(col.parse.callCount, 1);
  currentPageResetEventCount.resetHistory();
  fullCollectionAddEventCount.resetHistory();
  fullCollectionRemoveEventCount.resetHistory();
  fullCollectionResetEventCount.resetHistory();
  col.parse.resetHistory();
  col.parseLinks.resetHistory();

  // test paging backward use cache
  col.getPreviousPage();
  assert.strictEqual(col.parseLinks.called, false);
  assert.strictEqual(col.state.currentPage, 1);
  assert.strictEqual(col.state.totalRecords, 4);
  assert.strictEqual(col.state.totalPages, 2);
  assert.strictEqual(col.state.lastPage, 2);
  assert.strictEqual(col.fullCollection.length, 4);
  assert.deepEqual(col.links, {
    "1": "url",
    "2": "url2",
    "3": "url3"
  });
  assert.deepEqual(col.toJSON(), [{id: 2}, {id: 1}]);
  assert.deepEqual(col.fullCollection.toJSON(), [{id: 2}, {id: 1}, {id: 3}, {id: 4}]);
  assert.equal(currentPageResetEventCount.callCount, 1);
  assert.equal(fullCollectionAddEventCount.callCount, 0);
  assert.equal(fullCollectionRemoveEventCount.callCount, 0);
  assert.equal(fullCollectionResetEventCount.callCount, 0);
  currentPageResetEventCount.resetHistory();

  // test paging to last page
  col.getLastPage();
  assert.strictEqual(col.parseLinks.called, false);
  assert.strictEqual(col.state.currentPage, 2);
  assert.strictEqual(col.state.totalRecords, 4);
  assert.strictEqual(col.state.totalPages, 2);
  assert.strictEqual(col.state.lastPage, 2);
  assert.strictEqual(col.fullCollection.length, 4);
  assert.deepEqual(col.links, {
    "1": "url",
    "2": "url2",
    "3": "url3"
  });
  assert.deepEqual(col.toJSON(), [{id: 3}, {id: 4}]);
  assert.deepEqual(col.fullCollection.toJSON(), [{id: 2}, {id: 1}, {id: 3}, {id: 4}]);
  assert.equal(currentPageResetEventCount.callCount, 1);
  assert.equal(fullCollectionAddEventCount.callCount, 0);
  assert.equal(fullCollectionRemoveEventCount.callCount, 0);
  assert.equal(fullCollectionResetEventCount.callCount, 0);

  col.parseLinks.restore();
});

QUnit.test("hasNextPage and hasPreviousPage", function (assert) {
  var col = new (PageableCollection.extend({
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

  assert.strictEqual(col.hasPreviousPage(), false);
  assert.strictEqual(col.hasNextPage(), true);

  col.getNextPage();

  assert.strictEqual(col.hasPreviousPage(), true);
  assert.strictEqual(col.hasNextPage(), true);

  col.getLastPage();

  assert.strictEqual(col.hasPreviousPage(), true);
  assert.strictEqual(col.hasNextPage(), false);
});
