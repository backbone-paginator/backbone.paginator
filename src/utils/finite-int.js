import _ from "underscore";

export function finiteInt (val, name) {
  if (!_.isNumber(val) || _.isNaN(val) || !_.isFinite(val) || ~~val !== val) {
    throw new TypeError("`" + name + "` must be a finite integer");
  }
  return val;
}
