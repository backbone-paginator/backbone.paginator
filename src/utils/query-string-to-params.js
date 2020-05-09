import _ from "underscore";

var _isArray = _.isArray;

export function queryStringToParams (qs) {
  var kvp, k, v, ls, params = {}, decode = decodeURIComponent;
  var kvps = qs.split("&");
  for (var i = 0, l = kvps.length; i < l; i++) {
    var param = kvps[i];
    kvp = param.split("="), k = kvp[0], v = kvp[1];
    if (v == null) v = true;
    k = decode(k), v = decode(v), ls = params[k];
    if (_isArray(ls)) {
      ls.push(v);
    }
    else if (ls) {
      params[k] = [ls, v];
    }
    else {
      params[k] = v;
    }
  }
  return params;
}
