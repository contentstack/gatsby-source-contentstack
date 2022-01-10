'use strict';
/** NPM dependencies */

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var fetch = require('node-fetch');

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
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(pluginOptions) {
    var host;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
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
              headers: {
                api_key: "".concat(pluginOptions.api_key),
                access_token: "".concat(pluginOptions.delivery_token)
              }
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
      }
    }, _callee);
  }));

  return function validateContentstackAccess(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.deleteContentstackNodes = deleteContentstackNodes;
exports.validateContentstackAccess = validateContentstackAccess;