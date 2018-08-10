$(document).ready(function () {

  "use strict";

  var col;

  QUnit.module("Backbone.PageableCollection - switchMode", {

    beforeEach: function () {
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

  QUnit.test("switchMode", function (assert) {

    sinon.stub(col, "fetch");
    sinon.spy(col, "trigger");

    col.switchMode("client");

    assert.strictEqual(col.mode, "client");
    assert.ok(col.fullCollection instanceof Backbone.Collection);
    assert.ok(col.fetch.calledOnce);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.fetch.resetHistory();
    col.trigger.resetHistory();

    var comparator = col.fullCollection.comparator = function (model) {
      return model.get("name");
    };

    col.switchMode("server");

    assert.strictEqual(col.mode, "server");
    assert.ok(_.isUndefined(col.fullCollection));
    assert.ok(col.fetch.calledOnce);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.fetch.resetHistory();
    col.trigger.resetHistory();

    col.state.totalRecords = 20;
    col.switchMode("client", {fetch: false, resetState: false});

    assert.strictEqual(col.state.totalRecords, 20);
    assert.strictEqual(col.fullCollection.comparator, comparator);
    assert.ok(col.fetch.notCalled);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));

    col.fetch.resetHistory();
    col.trigger.resetHistory();

    col.switchMode("infinite");

    assert.strictEqual(col.mode, "infinite");
    assert.strictEqual(col.state.totalRecords, null);
    assert.ok(col.fullCollection);
    assert.ok(col.fetch.calledOnce);
    assert.ok(col.trigger.calledWith("pageable:state:change", col.state));
  });

});
