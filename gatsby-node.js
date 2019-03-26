"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require("./normalize"),
    normalizeEntry = _require.normalizeEntry,
    processContentType = _require.processContentType,
    processEntry = _require.processEntry;

var fetchData = require("./fetch");

exports.sourceNodes = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, configOptions) {
    var actions = _ref2.actions,
        createNodeId = _ref2.createNodeId;

    var createNode, _ref3, contentstackData, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, contentType, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, entry, normalizedEntry, entryNode, contentTypeNode;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            createNode = actions.createNode;
            _context.next = 3;
            return fetchData(configOptions);

          case 3:
            _ref3 = _context.sent;
            contentstackData = _ref3.contentstackData;


            // loop over all content types
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 8;
            _iterator = (0, _getIterator3.default)(contentstackData.contentTypes);

          case 10:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 46;
              break;
            }

            contentType = _step.value;

            // loop over all entries in that content type
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context.prev = 15;
            _iterator2 = (0, _getIterator3.default)(contentstackData.entries[contentType.uid]);

          case 17:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context.next = 27;
              break;
            }

            entry = _step2.value;
            _context.next = 21;
            return normalizeEntry(contentType, entry, contentstackData.entries, createNodeId);

          case 21:
            normalizedEntry = _context.sent;

            // Process the contentTypes data to match the structure of a Gatsby node
            entryNode = processEntry(contentType, normalizedEntry, createNodeId);
            // Use Gatsby's createNode helper to create a node from the node data

            createNode(entryNode);

          case 24:
            _iteratorNormalCompletion2 = true;
            _context.next = 17;
            break;

          case 27:
            _context.next = 33;
            break;

          case 29:
            _context.prev = 29;
            _context.t0 = _context["catch"](15);
            _didIteratorError2 = true;
            _iteratorError2 = _context.t0;

          case 33:
            _context.prev = 33;
            _context.prev = 34;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 36:
            _context.prev = 36;

            if (!_didIteratorError2) {
              _context.next = 39;
              break;
            }

            throw _iteratorError2;

          case 39:
            return _context.finish(36);

          case 40:
            return _context.finish(33);

          case 41:

            // Process the contentTypes data to match the structure of a Gatsby node
            contentTypeNode = processContentType(contentType, createNodeId);
            // Use Gatsby's createNode helper to create a node from the node data

            createNode(contentTypeNode);

          case 43:
            _iteratorNormalCompletion = true;
            _context.next = 10;
            break;

          case 46:
            _context.next = 52;
            break;

          case 48:
            _context.prev = 48;
            _context.t1 = _context["catch"](8);
            _didIteratorError = true;
            _iteratorError = _context.t1;

          case 52:
            _context.prev = 52;
            _context.prev = 53;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 55:
            _context.prev = 55;

            if (!_didIteratorError) {
              _context.next = 58;
              break;
            }

            throw _iteratorError;

          case 58:
            return _context.finish(55);

          case 59:
            return _context.finish(52);

          case 60:
            return _context.abrupt("return");

          case 61:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[8, 48, 52, 60], [15, 29, 33, 41], [34,, 36, 40], [53,, 55, 59]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();