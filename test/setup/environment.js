(function () {

  var history = window.history;
  var pushState = history.pushState;
  var replaceState = history.replaceState;

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
    history.pushState = history.replaceState = function () {};

  });

  QUnit.testDone(function () {
    history.pushState = pushState;
    history.replaceState = replaceState;

    sinon.restore();
  });

})();
