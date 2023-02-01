'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var Contentstack = require('@contentstack/utils');
var _require = require('./utils'),
  getJSONToHtmlRequired = _require.getJSONToHtmlRequired;
var _require2 = require('./normalize'),
  makeEntryNodeUid = _require2.makeEntryNodeUid,
  makeAssetNodeUid = _require2.makeAssetNodeUid;
exports.createResolvers = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(function (_ref2, configOptions) {
    var createResolvers = _ref2.createResolvers,
      cache = _ref2.cache,
      createNodeId = _ref2.createNodeId;
    return /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var resolvers, typePrefix, _yield$Promise$all, _yield$Promise$all2, fileFields, references, groups, jsonRteFields;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            resolvers = {};
            typePrefix = configOptions.type_prefix || 'Contentstack';
            _context.next = 4;
            return Promise.all([cache.get("".concat(typePrefix, "_").concat(configOptions.api_key, "_file_fields")), cache.get("".concat(typePrefix, "_").concat(configOptions.api_key, "_references")), cache.get("".concat(typePrefix, "_").concat(configOptions.api_key, "_groups")), cache.get("".concat(typePrefix, "_").concat(configOptions.api_key, "_json_rte_fields"))]);
          case 4:
            _yield$Promise$all = _context.sent;
            _yield$Promise$all2 = (0, _slicedToArray2["default"])(_yield$Promise$all, 4);
            fileFields = _yield$Promise$all2[0];
            references = _yield$Promise$all2[1];
            groups = _yield$Promise$all2[2];
            jsonRteFields = _yield$Promise$all2[3];
            fileFields && fileFields.forEach(function (fileField) {
              resolvers[fileField.parent] = _objectSpread(_objectSpread({}, resolvers[fileField.parent]), (0, _defineProperty2["default"])({}, fileField.field.uid, {
                resolve: function resolve(source, args, context) {
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
            references && references.forEach(function (reference) {
              resolvers[reference.parent] = _objectSpread(_objectSpread({}, resolvers[reference.parent]), {}, (0, _defineProperty2["default"])({}, reference.uid, {
                resolve: function resolve(source, args, context) {
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
            groups && groups.forEach(function (group) {
              resolvers[group.parent] = _objectSpread(_objectSpread({}, resolvers[group.parent]), (0, _defineProperty2["default"])({}, group.field.uid, {
                resolve: function resolve(source) {
                  if (group.field.multiple && !Array.isArray(source[group.field.uid])) {
                    return [];
                  }
                  return source[group.field.uid] || null;
                }
              }));
            });
            jsonRteFields && jsonRteFields.forEach(function (jsonRteField) {
              resolvers[jsonRteField.parent] = _objectSpread(_objectSpread({}, resolvers[jsonRteField.parent]), (0, _defineProperty2["default"])({}, jsonRteField.field.uid, {
                resolve: function resolve(source, args, context) {
                  if (getJSONToHtmlRequired(configOptions.jsonRteToHtml, jsonRteField.field)) {
                    var keys = Object.keys(source);
                    var embeddedItems = {};
                    for (var i = 0; i < keys.length; i++) {
                      var key = keys[i];
                      if (!source[key]) {
                        continue;
                      }
                      if (Array.isArray(source[key])) {
                        for (var j = 0; j < source[key].length; j++) {
                          if (source[key][j].type === 'doc') {
                            source[key] = parseJSONRTEToHtml(source[key][j].children, embeddedItems, key, source, context, createNodeId, typePrefix);
                          }
                        }
                      } else {
                        if (source[key].type === 'doc') {
                          source[key] = parseJSONRTEToHtml(source[key].children, embeddedItems, key, source, context, createNodeId, typePrefix);
                        }
                      }
                    }
                  }
                  return source[jsonRteField.field.uid] || null;
                }
              }));
            });
            createResolvers(resolvers);
          case 15:
          case "end":
            return _context.stop();
        }
      }, _callee);
    })();
  });
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
function parseJSONRTEToHtml(children, embeddedItems, key, source, context, createNodeId, prefix) {
  embeddedItems[key] = embeddedItems[key] || [];
  getChildren(children, embeddedItems, key, source, context, createNodeId, prefix);
  source._embedded_items = _objectSpread(_objectSpread({}, source._embedded_items), embeddedItems);
  return parseJSONRteToHtmlHelper(source, key);
}
function getChildren(children, embeddedItems, key, source, context, createNodeId, prefix) {
  for (var j = 0; j < children.length; j++) {
    var child = children[j];
    if (child.type === 'reference') {
      var id = void 0;
      if (child.attrs && child.attrs.type === 'asset') {
        id = makeAssetNodeUid({
          publish_details: {
            locale: source.publish_details.locale
          },
          uid: child.attrs['asset-uid']
        }, createNodeId, prefix);
      } else {
        id = makeEntryNodeUid({
          publish_details: {
            locale: source.publish_details.locale
          },
          uid: child.attrs['entry-uid']
        }, createNodeId, prefix);
      }
      var node = context.nodeModel.getNodeById({
        id: id
      });
      // The following line is required by contentstack utils package to parse value from json to html.
      node._content_type_uid = child.attrs['content-type-uid'];
      embeddedItems[key].push(node);
    }
    if (child.children) {
      getChildren(child.children, embeddedItems, key, source, context, createNodeId, prefix);
    }
  }
}
function parseJSONRteToHtmlHelper(value, path) {
  var jsonRteToHtml = {};
  if (value) {
    Contentstack.jsonToHTML({
      entry: value,
      paths: [path]
    });
    jsonRteToHtml = value[path];
  } else {
    jsonRteToHtml = null;
  }
  return jsonRteToHtml;
}
;
//# sourceMappingURL=create-resolvers.js.map