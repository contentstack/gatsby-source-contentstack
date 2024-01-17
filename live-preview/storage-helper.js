"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Storage = void 0;
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
// This is a helper class to help store key-value data inside
// an individual Storage object's key. 
// It simply performs the JSON parsing and stringifying steps
var Storage = /*#__PURE__*/function () {
  /**
   * @param {string} name 
   * @param {Storage.prototype} storage 
   */
  function Storage(storage, name) {
    (0, _classCallCheck2["default"])(this, Storage);
    (0, _defineProperty2["default"])(this, "storage", void 0);
    (0, _defineProperty2["default"])(this, "name", void 0);
    if (!(storage !== null && storage !== void 0 && storage.__proto__) === Storage.prototype) {
      throw new Error("storage should implment Web Storage API");
    }
    this.storage = storage;
    this.name = "cslp_" + name;
    var stored = this.storage.getItem(this.name);
    if (!stored) {
      this.storage.setItem(this.name, "{}");
    }
  }
  (0, _createClass2["default"])(Storage, [{
    key: "getArea",
    value: function getArea() {
      var area = JSON.parse(this.storage.getItem(this.name));
      return area;
    }
  }, {
    key: "set",
    value: function set(key, value) {
      var area = this.getArea();
      area[key] = value;
      this.storage.setItem(this.name, JSON.stringify(area));
    }
  }, {
    key: "get",
    value: function get(key) {
      if (!key) {
        return this.getArea();
      }
      var area = this.getArea();
      return area[key];
    }
  }]);
  return Storage;
}();
exports.Storage = Storage;
//# sourceMappingURL=storage-helper.js.map