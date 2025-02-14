'use strict';

/*
  `node-fetch` have different export depending on CJS or ESM
  context - requiring CJS (regular build) will return a function directly,
  requiring ESM (what is currently being bundled for rendering engines
  which are used by DSG) will return object with `default` field which is
  a function. `preferDefault` helper will just use `.default` if available,
  but will fallback to entire export if not available
*/
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var preferDefault = function preferDefault(m) {
  return m && m["default"] || m;
};
var fetch = preferDefault(require('node-fetch'));
var _require = require('./utils'),
  getCustomHeaders = _require.getCustomHeaders;
var deleteContentstackNodes = function deleteContentstackNodes(item, type, createNodeId, getNode, deleteNode, typePrefix) {
  var nodeId = '';
  var node = null;
  if (type === 'entry') {
    nodeId = createNodeId("".concat(typePrefix.toLowerCase(), "-entry-").concat(item.uid, "-").concat(item.locale));
  }
  if (type === 'asset') {
    nodeId = createNodeId("".concat(typePrefix.toLowerCase(), "-assets-").concat(item.uid, "-").concat(item.locale));
  }
  node = getNode(nodeId);
  if (node) {
    deleteNode(node);
  }
};
var validateContentstackAccess = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(pluginOptions) {
    var host;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (!(process.env.NODE_ENV === "test")) {
            _context.next = 2;
            break;
          }
          return _context.abrupt("return", undefined);
        case 2:
          host = pluginOptions.cdn ? pluginOptions.cdn : 'https://cdn.contentstack.io/v3';
          _context.next = 5;
          return fetch("".concat(host, "/content_types?include_count=false"), {
            headers: _objectSpread({
              api_key: "".concat(pluginOptions.api_key),
              access_token: "".concat(pluginOptions.delivery_token),
              branch: pluginOptions === null || pluginOptions === void 0 ? void 0 : pluginOptions.branch
            }, getCustomHeaders(pluginOptions === null || pluginOptions === void 0 ? void 0 : pluginOptions.enableEarlyAccessKey, pluginOptions === null || pluginOptions === void 0 ? void 0 : pluginOptions.enableEarlyAccessValue))
          }).then(function (res) {
            return res.ok;
          }).then(function (ok) {
            if (!ok) throw new Error("Cannot access Contentstack with api_key=".concat(pluginOptions.api_key, " & delivery_token=").concat(pluginOptions.delivery_token, "."));
          });
        case 5:
          return _context.abrupt("return", undefined);
        case 6:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function validateContentstackAccess(_x) {
    return _ref.apply(this, arguments);
  };
}();
exports.deleteContentstackNodes = deleteContentstackNodes;
exports.validateContentstackAccess = validateContentstackAccess;
//# sourceMappingURL=node-helper.js.map