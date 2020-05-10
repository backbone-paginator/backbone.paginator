export function install (testCase) {
  testCase.xhr = sinon.useFakeXMLHttpRequest();
  var requests = testCase.requests = [];
  testCase.xhr.onCreate = function (xhr) {
    requests.push(xhr);
  };
}

export function uninstall (testCase) {
  testCase.xhr.restore();
}
