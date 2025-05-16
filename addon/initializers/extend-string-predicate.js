import { StringPredicate } from "ember-flexberry-data/query/predicate";

export function initialize() {
  StringPredicate.prototype.startsWith = function (value) {
    this.condition = "startswith";
    this._containsValue = value;
    return this;
  };

  StringPredicate.prototype.endsWith = function (value) {
    this.condition = "endswith";
    this._containsValue = value;
    return this;
  };
}

export default {
  name: "extend-string-predicate",
  initialize,
};
