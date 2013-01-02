$(document).ready(function () {

  "use strict";

  var col;

  module("Backbone.PageableCollection - Infinite", {
    setup: function () {
      col = new Backbone.PageableCollection(null, {
        mode: "infinite"
      });
      col.links = {
        first: "firstUrl",
        prev: "prevUrl",
        next: "nextUrl",
        last: "lastUrl"
      };
    }
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

    var links = col.parseLinks({}, xhr);

    deepEqual(links, {
      last: "https://api.github.com/user/repos?page=50&per_page=100",
      next: "https://api.github.com/user/repos?page=3&per_page=100"
    });

  });

  test("fetch calls next link", 1, function () {
    col.getNextPage = function () {
      ok(true);
    };

    col.fetch();
  });

  test("getPage", 4, function () {
    throws(function () {
      col.getPage("nosuchpage");
    });

    col.parseLinks = function () {
      ok(true);
    };

    col.fetch = function (options) {
      deepEqual(options, {
        url: "nextUrl",
        type: "jsonp"
      });

      ok(this.state.currentPage === 2);

      return {
        done: function (fn) {
          fn();
        }
      };
    };

    col.getPage("next", {
      type: "jsonp"
    });
  });

});
