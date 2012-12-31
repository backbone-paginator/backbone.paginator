$(document).ready(function () {

  "use strict";

  var col;

  module("Backbone.PageableCollection - switchMode", {

    setup: function () {
      col = new Backbone.PageableCollection([
        {name: "a"},
        {name: "c"},
        {name: "b"}
      ], {
        state: {
          pageSize: 2
        }
      });
    }

  });

  test("switchMode", function () {

    this.stub(col, "fetch");

    col.switchMode("client");

    ok(col.fullCollection instanceof Backbone.Collection);
    ok(col.fetch.calledOnce);

    col.fetch.reset();

    var comparator = col.fullCollection.comparator = function (model) {
      return model.get("name");
    };

    col.switchMode("server");

    ok(_.isUndefined(col.fullCollection));
    ok(col.fetch.calledOnce);

    col.fetch.reset();

    col.state.totalRecords = 20;
    col.switchMode("client", {fetch: false, resetState: false});

    ok(col.state.totalRecords === 20);
    ok(col.fullCollection.comparator === comparator);

    ok(col.fetch.notCalled);

    col.fetch.reset();

    col.switchMode("infinite");

    ok(col.state.totalRecords == null);
    ok(_.isUndefined(col.fullCollection));
    ok(col.fetch.calledOnce);

    col.fetch.reset();
  });

});
