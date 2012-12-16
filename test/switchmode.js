$(document).ready(function () {

  module("Backbone.PageableCollection - switchMode");

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

    col.switchMode("client", {fetch: false});

    ok(col.fullCollection.comparator === comparator);

    ok(col.fetch.notCalled);

    col.fetch.reset();

    col.switchMode("infinite");

    ok(_.isUndefined(col.fullCollection));
    ok(col.fetch.calledOnce);

    col.fetch.reset();
    
  });

});
