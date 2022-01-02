'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

exports.createResolvers = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(_ref2, configOptions) {
    var createResolvers, cache, resolvers, typePrefix, _yield$Promise$all, _yield$Promise$all2, fileFields, references, groups;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            createResolvers = _ref2.createResolvers, cache = _ref2.cache;
            resolvers = {};
            typePrefix = configOptions.type_prefix || 'Contentstack';
            _context.next = 5;
            return Promise.all([cache.get("".concat(typePrefix, "_").concat(configOptions.api_key, "_file_fields")), cache.get("".concat(typePrefix, "_").concat(configOptions.api_key, "_references")), cache.get("".concat(typePrefix, "_").concat(configOptions.api_key, "_groups"))]);

          case 5:
            _yield$Promise$all = _context.sent;
            _yield$Promise$all2 = (0, _slicedToArray2["default"])(_yield$Promise$all, 3);
            fileFields = _yield$Promise$all2[0];
            references = _yield$Promise$all2[1];
            groups = _yield$Promise$all2[2];
            fileFields.forEach(function (fileField) {
              resolvers[fileField.parent] = _objectSpread(_objectSpread({}, resolvers[fileField.parent]), (0, _defineProperty2["default"])({}, fileField.field.uid, {
                resolve: function resolve(source, args, context, info) {
                  if (fileField.field.multiple && source["".concat(fileField.field.uid, "___NODE")]) {
                    var nodesData = [];
                    source["".concat(fileField.field.uid, "___NODE")].forEach(function (id) {
                      var existingNode = context.nodeModel.getNodeById({
                        id: id
                      });

                      if (existingNode) {
                        nodesData.push(existingNode);
                      }
                    });
                    return nodesData;
                  } else {
                    var id = source["".concat(fileField.field.uid, "___NODE")];
                    return context.nodeModel.getNodeById({
                      id: id
                    });
                  }
                }
              }));
            });
            references.forEach(function (reference) {
              resolvers[reference.parent] = _objectSpread(_objectSpread({}, resolvers[reference.parent]), {}, (0, _defineProperty2["default"])({}, reference.uid, {
                resolve: function resolve(source, args, context, info) {
                  if (source["".concat(reference.uid, "___NODE")]) {
                    var nodesData = [];
                    source["".concat(reference.uid, "___NODE")].forEach(function (id) {
                      var existingNode = context.nodeModel.getNodeById({
                        id: id
                      });

                      if (existingNode) {
                        nodesData.push(existingNode);
                      }
                    });
                    return nodesData;
                  }

                  return [];
                }
              }));
            });
            groups.forEach(function (group) {
              resolvers[group.parent] = _objectSpread(_objectSpread({}, resolvers[group.parent]), (0, _defineProperty2["default"])({}, group.field.uid, {
                resolve: function resolve(source) {
                  if (group.field.multiple && !Array.isArray(source[group.field.uid])) {
                    return [];
                  }

                  return source[group.field.uid] || null;
                }
              }));
            });
            createResolvers(resolvers);

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();