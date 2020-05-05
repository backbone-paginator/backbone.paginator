(function () {

  QUnit.testStart(function () {
    var env = QUnit.config.current.testEnvironment;

    env.mockXHR = {
      install: function (testCase) {
        testCase.xhr = sinon.useFakeXMLHttpRequest();
        var requests = testCase.requests = [];
        testCase.xhr.onCreate = function (xhr) {
          requests.push(xhr);
        };
      },

      uninstall: function (testCase) {
        testCase.xhr.restore();
      }
    };

    // We never want to actually call these during tests.
    sinon.stub(window.history, "pushState");
    sinon.stub(window.history, "replaceState");
  });

  QUnit.testDone(function () {
    sinon.restore();
  });

})();
