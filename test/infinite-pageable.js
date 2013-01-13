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
          pageSize: 2
        },
        mode: "infinite"
      });
    }
  });

  test("initialize", function () {
    ok(col.fullCollection instanceof Backbone.Collection);
    ok(col.url, "url");
    ok(col.mode, "infinite");
    deepEqual(col.links, {
      first: "url",
      "1": "url",
      current: "url"
    });
    deepEqual(col.toJSON(), [{id: 1}, {id: 3}]);
    deepEqual(col.fullCollection.toJSON(), [{id: 1}, {id: 3}, {id: 2}, {id: 4}]);
  });

  test("parseLinks", function () {
    var xhr = {
      getResponseHeader: function (header) {
        if (header.toLowerCase() == "link") {
          return '<https://api.github.com/user/repos?page=3&per_page=100>; rel="next", <https://api.github.com/user/repos?page=50&per_page=100>; rel="last"';
        }
        return null;
      }
    };

    var links = col.parseLinks({}, {xhr: xhr});

    deepEqual(links, {
      last: "https://api.github.com/user/repos?page=50&per_page=100",
      next: "https://api.github.com/user/repos?page=3&per_page=100"
    });

  });

  test("fetch defaults to the url for the current page", 2, function () {
    this.spy(Backbone.Collection.prototype, "fetch");
    col.fetch();
    ok(Backbone.Collection.prototype.fetch.calledOnce);
    ok(Backbone.Collection.prototype.fetch.args[0][0].url === "url");
    Backbone.Collection.prototype.fetch.restore();
  });

  test("getPage", 45, function () {
    throws(function () {
      col.getPage("nosuchpage");
    });

    this.spy(col, "fetch");
    this.spy(col, "parseLinks");

    col.getPage("first", {
      type: "jsonp"
    });

    ok(!col.fetch.called);
    ok(!col.parseLinks.called);
    ok(col.state.currentPage === 1);
    ok(col.state.totalRecords === 4);

    col.fetch.restore();
    col.parseLinks.restore();

    var oldAjax = jQuery.ajax;
    jQuery.ajax = function (settings) {
      settings.success();
      return $.Deferred().resolve();
    };
    this.stub(col, "parse").returns([{id: 5}]);
    this.stub(col, "parseLinks").returns({next: "next"});
    this.spy(col, "fetch");

    col.getPage(col.state.currentPage, {fetch: true});

    ok(col.parse.calledOnce);
    ok(col.parseLinks.calledOnce);
    ok(col.fetch.calledOnce);
    ok(col.fetch.args[0][0].url === "url");
    ok(col.fetch.args[0][0].update === true);
    ok(col.fetch.args[0][0].remove === false);
    ok(col.fullCollection.size() === 5);
    ok(col.fullCollection.last().id === 5);
    ok(col.size() === 2);
    ok(col.state.currentPage === 1);
    ok(col.state.totalRecords === 5);
    deepEqual(col.links, {
      first: "url",
      next: "next",
      current: "url",
      "1": "url"
    });

    col.parse.restore();
    col.parseLinks.restore();
    col.fetch.reset();

    // test page forward
    this.stub(col, "parse").returns([{id: 6}]);
    this.stub(col, "parseLinks").returns({next: "nextNext"});

    col.getPage("next");

    ok(col.parse.calledOnce);
    ok(col.parseLinks.calledOnce);
    ok(col.fetch.calledOnce);
    ok(col.fetch.args[0][0].url === "next");
    ok(col.fetch.args[0][0].update === true);
    ok(col.fetch.args[0][0].remove === false);
    ok(col.fullCollection.size() === 6);
    ok(col.fullCollection.last().id === 6);
    ok(col.size() === 2);
    ok(col.state.currentPage === 2);
    ok(col.state.totalRecords === 6);
    ok(col.at(0).id === 2);
    ok(col.at(1).id === 4);
    deepEqual(col.links, {
      first: "url",
      next: "nextNext",
      current: "next",
      "1": "url",
      "2": "next"
    });

    col.parse.restore();
    col.parseLinks.restore();
    col.fetch.reset();

    // test force fetch
    this.stub(col, "parse").returns([{id: 7}]);
    this.stub(col, "parseLinks").returns({next: "next"});

    col.getPage("first", {fetch: true});

    ok(col.parse.calledOnce);
    ok(col.parseLinks.calledOnce);
    ok(col.fetch.calledOnce);
    ok(col.fetch.args[0][0].url === "url");
    ok(col.fetch.args[0][0].update === true);
    ok(col.fetch.args[0][0].remove === false);
    ok(col.fullCollection.size() === 7);
    ok(col.fullCollection.last().id === 7);
    ok(col.size() === 2);
    ok(col.state.currentPage === 1);
    ok(col.state.totalRecords === 7);
    ok(col.at(0).id === 1);
    ok(col.at(1).id === 3);
    deepEqual(col.links, {
      first: "url",
      next: "next",
      current: "url",
      "1": "url",
      "2": "next"
    });

    col.parse.restore();
    col.parseLinks.restore();
    col.fetch.restore();
    jQuery.ajax = oldAjax;
  });

});
