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

    sinon.stub(col, "fetch");

    col.switchMode("client");

    strictEqual(col.mode, "client");
    ok(col.fullCollection instanceof Backbone.Collection);
    ok(col.fetch.calledOnce);

    col.fetch.reset();

    var comparator = col.fullCollection.comparator = function (model) {
      return model.get("name");
    };

    col.switchMode("server");

    strictEqual(col.mode, "server");
    ok(_.isUndefined(col.fullCollection));
    ok(col.fetch.calledOnce);

    col.fetch.reset();

    col.state.totalRecords = 20;
    col.switchMode("client", {fetch: false, resetState: false});

    strictEqual(col.state.totalRecords, 20);
    strictEqual(col.fullCollection.comparator, comparator);

    ok(col.fetch.notCalled);

    col.fetch.reset();

    col.switchMode("infinite");

    strictEqual(col.mode, "infinite");
    strictEqual(col.state.totalRecords, null);
    ok(col.fullCollection);
    ok(col.fetch.calledOnce);

    col.fetch.reset();
  });

});
