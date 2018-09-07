"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require("./normalize"),
    normalizeFields = _require.normalizeFields,
    normalizeEntry = _require.normalizeEntry,
    processContentType = _require.processContentType,
    processEntry = _require.processEntry;

var fetchData = require("./fetch");

exports.sourceNodes = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, configOptions) {
        var boundActionCreators = _ref2.boundActionCreators,
            createNodeId = _ref2.createNodeId;

        var createNode, _ref3, contentstackData;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        createNode = boundActionCreators.createNode;
                        _context.next = 3;
                        return fetchData(configOptions);

                    case 3:
                        _ref3 = _context.sent;
                        contentstackData = _ref3.contentstackData;


                        contentstackData.contentTypes.forEach(function (contentType) {
                            var entries = contentstackData.entries[contentType.uid];

                            entries.forEach(function (entry) {
                                var normalizedEntry = normalizeEntry(contentType, entry, contentstackData.entries, createNodeId);
                                // Process the contentTypes data to match the structure of a Gatsby node
                                var entryNode = processEntry(contentType, normalizedEntry, createNodeId);
                                // Use Gatsby's createNode helper to create a node from the node data
                                createNode(entryNode);
                            });

                            // Process the contentTypes data to match the structure of a Gatsby node
                            var contentTypeNode = processContentType(contentType, createNodeId);
                            // Use Gatsby's createNode helper to create a node from the node data
                            createNode(contentTypeNode);
                        });

                        return _context.abrupt("return");

                    case 7:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();