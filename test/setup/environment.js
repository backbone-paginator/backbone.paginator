(function () {

  var ajax = Backbone.ajax;
  var emulateHTTP = Backbone.emulateHTTP;
  var emulateJSON = Backbone.emulateJSON;
  var history = window.history;
  var pushState = history.pushState;
  var replaceState = history.replaceState;

  QUnit.testStart(function () {
    var env = QUnit.config.current.testEnvironment;

    // We never want to actually call these during tests.
    history.pushState = history.replaceState = function () {};

    // Capture ajax settings for comparison.
    Backbone.ajax = function (settings) {
      env.ajaxSettings = settings;
    };

  });

  QUnit.testDone(function () {
    Backbone.ajax = ajax;
    Backbone.emulateHTTP = emulateHTTP;
    Backbone.emulateJSON = emulateJSON;
    history.pushState = pushState;
    history.replaceState = replaceState;

    sinon.restore();
  });

})();
