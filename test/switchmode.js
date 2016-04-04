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
    sinon.spy(col, "trigger");

    col.switchMode("client");

    strictEqual(col.mode, "client");
    ok(col.fullCollection instanceof Backbone.Collection);
    ok(col.fetch.calledOnce);
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.fetch.reset();
    col.trigger.reset();

    var comparator = col.fullCollection.comparator = function (model) {
      return model.get("name");
    };

    col.switchMode("server");

    strictEqual(col.mode, "server");
    ok(_.isUndefined(col.fullCollection));
    ok(col.fetch.calledOnce);
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.fetch.reset();
    col.trigger.reset();

    col.state.totalRecords = 20;
    col.switchMode("client", {fetch: false, resetState: false});

    strictEqual(col.state.totalRecords, 20);
    strictEqual(col.fullCollection.comparator, comparator);
    ok(col.fetch.notCalled);
    ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.fetch.reset();
    col.trigger.reset();

    col.switchMode("infinite");

    strictEqual(col.mode, "infinite");
    strictEqual(col.state.totalRecords, null);
    ok(col.fullCollection);
    ok(col.fetch.calledOnce);
    ok(col.trigger.calledWith("pageable:state:change", col.state));
  });

});
