$(document).ready(function () {

  module("Backbone.PageableCollection");

  test("switchMode", function () {

    var col = new Backbone.PageableCollection([
      {name: "a"},
      {name: "c"},
      {name: "b"}
    ], {
      state: {
        pageSize: 2
      }
    });

    this.stub(col, "fetch");

    col.switchMode();

    ok(col.fullCollection instanceof Backbone.Collection);
    ok(col.fetch.calledOnce);

    col.fetch.reset();

    var comparator = col.fullCollection.comparator = function (model) {
      return model.get("name");
    };

    col.switchMode();

    ok(_.isUndefined(col.fullCollection));
    ok(col.fetch.calledOnce);

    col.fetch.reset();

    col.switchMode({fetch: false});

    ok(col.fullCollection.comparator === comparator);

    ok(col.fetch.notCalled);

  });

});
