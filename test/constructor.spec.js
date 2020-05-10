import PageableCollection from "../src/backbone.paginator";

const {test} = QUnit;

QUnit.module("constructor", function () {
  QUnit.module("mode", {
    beforeEach () {
      this.InfiniteCollection = PageableCollection.extend({
        mode: "infinite"
      });
    }
  }, function () {
    test("should set from options", function (assert) {
      const collection = new PageableCollection(null, {
        mode: "infinite"
      });
      assert.strictEqual(collection.mode, "infinite");

      const childCollection = new this.InfiniteCollection(null, {
        mode: "client"
      });
      assert.strictEqual(childCollection.mode, "client");
    });

    test("should inherit from child instance", function (assert) {
      const collection = new this.InfiniteCollection();

      assert.strictEqual(collection.mode, "infinite");
    });
  });

  QUnit.module("queryParams", {
    beforeEach () {
      this.ChildCollection = PageableCollection.extend({
        queryParams: {
          pageSize: "child_page_size"
        }
      });
    }
  }, function () {
    test("should set from options", function (assert) {
      const collection = new PageableCollection(null, {
        queryParams: {
          pageSize: "options_page_size"
        }
      });
      assert.strictEqual(collection.queryParams.pageSize, "options_page_size");

      const childCollection = new this.ChildCollection(null, {
        queryParams: {
          pageSize: "another_options_page_size"
        }
      });
      assert.strictEqual(childCollection.queryParams.pageSize, "another_options_page_size");
    });

    test("should inherit from child instance", function (assert) {
      const collection = new this.ChildCollection();

      assert.strictEqual(collection.queryParams.pageSize, "child_page_size");
    });
  });

  QUnit.module("queryParams.directions", {
    beforeEach () {
      this.ChildCollection = PageableCollection.extend({
        queryParams: {
          directions: {
            "-1": "child_query_direction"
          }
        }
      });
    }
  }, function () {
    test("should set from options", function (assert) {
      const collection = new PageableCollection(null, {
        queryParams: {
          directions: {
            "-1": "options_query_direction"
          }
        }
      });
      assert.strictEqual(collection.queryParams.directions["-1"], "options_query_direction");

      const childCollection = new this.ChildCollection(null, {
        queryParams: {
          directions: {
            "-1": "another_options_query_direction"
          }
        }
      });
      assert.strictEqual(
          childCollection.queryParams.directions["-1"],
          "another_options_query_direction"
      );
    });

    test("should inherit from child instance", function (assert) {
      const collection = new this.ChildCollection();
      assert.strictEqual(collection.queryParams.directions["-1"], "child_query_direction");
    });
  });

  QUnit.module("state", {
    beforeEach () {
      this.ChildCollection = PageableCollection.extend({
        state: {
          pageSize: 250
        }
      });
    }
  }, function () {
    test("should set from options", function (assert) {
      const collection = new PageableCollection(null, {
        state: {
          pageSize: 2
        }
      });
      assert.strictEqual(collection.state.pageSize, 2);

      const childCollection = new this.ChildCollection(null, {
        state: {
          pageSize: 3
        }
      });
      assert.strictEqual(childCollection.state.pageSize, 3);
    });

    test("should inherit from child instance", function (assert) {
      const collection = new this.ChildCollection();
      assert.strictEqual(collection.state.pageSize, 250);
    });

    test("should fallback `currentPage` to `firstPage`", function (assert) {
      const collection = new PageableCollection(null, {
        state: {
          firstPage: 0
        }
      });
      assert.strictEqual(collection.state.currentPage, 0);
    });

    test("should set `currentPage` when it exist", function (assert) {
      const collection = new PageableCollection(null, {
        state: {
          currentPage: 10
        }
      });
      assert.strictEqual(collection.state.currentPage, 10);
    });
  });

  test("should switch mode", function (assert) {
    sinon.spy(PageableCollection.prototype, "switchMode");
    const collection = new PageableCollection();

    assert.ok(collection.switchMode.calledWith("server", {
      fetch: false,
      resetState: false,
      models: []
    }));
  });

  test("should set sorting with `state.sortKey`", function (assert) {
    sinon.spy(PageableCollection.prototype, "setSorting");

    const collection = new PageableCollection(null, {
      state: {
        sortKey: "sort_attribute"
      }
    });
    assert.ok(
        collection.setSorting.calledWith("sort_attribute", -1, sinon.match.object)
    );
  });
});

QUnit.module("constructor (client/infinite)", function () {
  QUnit.module("state", function () {
    QUnit.module("totalRecords", {
      beforeEach () {
        this.models = [
          {id: 1},
          {id: 2},
          {id: 3},
          {id: 2}
        ];
        this.ClientCollection = PageableCollection.extend({
          mode: "client"
        });
        this.InfiniteCollection = PageableCollection.extend({
          // Infinite mode require links for every model, they are fulfilled from collection url
          url: "test",
          mode: "infinite"
        });
      }
    }, function () {
      test("should be set to given models length", function (assert) {
        const clientCollection = new this.ClientCollection(this.models);
        assert.strictEqual(clientCollection.state.totalRecords, 3);

        const infiniteCollection = new this.InfiniteCollection(this.models);
        assert.strictEqual(infiniteCollection.state.totalRecords, 3);
      });

      test("should preserve `totalRecords` from options", function (assert) {
        const clientCollection = new this.ClientCollection(this.models, {
          state: {
            totalRecords: 100
          }
        });
        assert.strictEqual(clientCollection.state.totalRecords, 100);

        const infiniteCollection = new this.InfiniteCollection(this.models, {
          state: {
            totalRecords: 100
          }
        });
        assert.strictEqual(infiniteCollection.state.totalRecords, 100);
      });
    });
  });

  QUnit.module("fullCollection", function () {
    test("should set comparator", function (assert) {
      const clientCollection = new PageableCollection(null, {
        mode: "client",
        comparator: "client_comparator_attribute",
        full: true
      });

      assert.strictEqual(clientCollection.fullCollection.comparator, "client_comparator_attribute");
      assert.strictEqual(clientCollection.comparator, null);

      const infiniteCollection = new PageableCollection(null, {
        mode: "infinite",
        comparator: "infinite_comparator_attribute",
        full: true
      });
      assert.strictEqual(
          infiniteCollection.fullCollection.comparator,
          "infinite_comparator_attribute"
      );
      assert.strictEqual(infiniteCollection.comparator, null);
    });

    test("should sort", function (assert) {
      const fullCollectionStub = sinon.stub();
      fullCollectionStub.on = sinon.stub();
      fullCollectionStub.sort = sinon.stub();
      sinon.stub(PageableCollection.prototype, "_makeFullCollection").returns(fullCollectionStub);

      const clientCollection = new PageableCollection(null, {
        mode: "client",
        full: true
      });
      assert.ok(clientCollection.fullCollection.sort.calledOnce);
    });
  });

  test("should switch page when models set", function (assert) {
    sinon.stub(PageableCollection.prototype, "getPage");

    const clientCollection = new PageableCollection([
      {id: 1}
    ], {
      mode: "client"
    });
    assert.ok(clientCollection.getPage.calledWith(1));

    const infiniteCollection = new PageableCollection([
      {id: 1}
    ], {
      mode: "infinite"
    });
    assert.ok(infiniteCollection.getPage.calledWith(1));
  });
});
