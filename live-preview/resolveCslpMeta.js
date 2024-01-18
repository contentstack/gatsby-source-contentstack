"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveCslpMeta = resolveCslpMeta;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _getCslpMetaPaths = require("./getCslpMetaPaths");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function resolveCslpMeta(_ref) {
  var _fieldNode$name, _fieldNode$name$loc, _fieldNode$name2, _fieldNode$name2$loc, _info$fragments;
  var source = _ref.source,
    _args = _ref.args,
    _context = _ref.context,
    info = _ref.info,
    contentTypeMap = _ref.contentTypeMap,
    typePrefix = _ref.typePrefix;
  var entryUid = source.uid;
  var contentTypeNodeType = source.internal.type;
  var queryContentTypeUid = contentTypeNodeType.replace("".concat(typePrefix, "_"), "");
  var fieldNode = info.fieldNodes.find(function (node) {
    var _node$name;
    return ((_node$name = node.name) === null || _node$name === void 0 ? void 0 : _node$name.value) === "cslp__meta";
  });
  var fieldNodeValue = "cslp__meta";
  var fieldNodeLocation = {
    start: (_fieldNode$name = fieldNode.name) === null || _fieldNode$name === void 0 ? void 0 : (_fieldNode$name$loc = _fieldNode$name.loc) === null || _fieldNode$name$loc === void 0 ? void 0 : _fieldNode$name$loc.start,
    end: (_fieldNode$name2 = fieldNode.name) === null || _fieldNode$name2 === void 0 ? void 0 : (_fieldNode$name2$loc = _fieldNode$name2.loc) === null || _fieldNode$name2$loc === void 0 ? void 0 : _fieldNode$name2$loc.end
  };

  // We have all the query selections (`info.operation.selectionSet.selections`) 
  // each time we resolve cslp__meta.
  // So, get the correct Selection from query for the current cslp__meta
  var queryContentTypeSelection = findQuerySelection(info.operation.selectionSet, fieldNodeValue, fieldNodeLocation);
  if (typeof queryContentTypeSelection === "undefined") {
    return {
      error: {
        message: "failed to find query selection for cslp__meta"
      }
    };
  }
  var fragments = (_info$fragments = info === null || info === void 0 ? void 0 : info.fragments) !== null && _info$fragments !== void 0 ? _info$fragments : {};
  var contentType = contentTypeMap[queryContentTypeUid];
  // for the content type selection, get the reference and json RTE paths
  var metaPaths = (0, _getCslpMetaPaths.getCslpMetaPaths)(queryContentTypeSelection, "", contentType, fragments, contentTypeMap, typePrefix);
  var result = _objectSpread({
    entryUid: entryUid,
    contentTypeUid: contentType.uid
  }, metaPaths);
  return result;
}
function findQuerySelection(selectionSet, value, location) {
  var depth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  // cslp__meta can only be one level deep (or two level deep, see all* case below) 
  // e.g.
  // query {
  //   page {
  //     cslp__meta
  //   }
  //   allBlog {
  //     nodes {
  //       cslp__meta
  //     }
  //   }
  // }
  if (depth > 1 || !selectionSet || !selectionSet.selections) {
    return;
  }
  var _iterator = _createForOfIteratorHelper(selectionSet.selections),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _selection$name, _selection$loc, _selection$loc2, _selection$name2;
      var selection = _step.value;
      if (((_selection$name = selection.name) === null || _selection$name === void 0 ? void 0 : _selection$name.value) === value && ((_selection$loc = selection.loc) === null || _selection$loc === void 0 ? void 0 : _selection$loc.start) === location.start && ((_selection$loc2 = selection.loc) === null || _selection$loc2 === void 0 ? void 0 : _selection$loc2.end) === location.end) {
        return selectionSet;
      }
      // "nodes" in all* queries will lead to cslp__meta at depth 2
      if (((_selection$name2 = selection.name) === null || _selection$name2 === void 0 ? void 0 : _selection$name2.value) === "nodes") {
        var _nestedSelectionSet = findQuerySelection(selection.selectionSet, value, location, depth);
        if (_nestedSelectionSet) {
          return _nestedSelectionSet;
        }
      }
      // search one level deeper for the correct node in this selection
      var nestedSelectionSet = findQuerySelection(selection.selectionSet, value, location, depth + 1);
      // return when not undefined, meaning the correct selection has been found
      if (nestedSelectionSet) {
        return nestedSelectionSet;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}
//# sourceMappingURL=resolveCslpMeta.js.map