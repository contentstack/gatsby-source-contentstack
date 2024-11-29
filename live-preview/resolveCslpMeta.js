"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveCslpMeta = resolveCslpMeta;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _getCslpMetaPaths = require("./getCslpMetaPaths");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function resolveCslpMeta(_ref) {
  var _fieldNode$name, _fieldNode$name2, _info$fragments;
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
    start: (_fieldNode$name = fieldNode.name) === null || _fieldNode$name === void 0 || (_fieldNode$name = _fieldNode$name.loc) === null || _fieldNode$name === void 0 ? void 0 : _fieldNode$name.start,
    end: (_fieldNode$name2 = fieldNode.name) === null || _fieldNode$name2 === void 0 || (_fieldNode$name2 = _fieldNode$name2.loc) === null || _fieldNode$name2 === void 0 ? void 0 : _fieldNode$name2.end
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