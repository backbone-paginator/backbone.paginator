QUnit.testStart(function () {
  // We never want to actually call these during tests.
  sinon.stub(window.history, "pushState");
  sinon.stub(window.history, "replaceState");
});

QUnit.testDone(function () {
  sinon.restore();
});
