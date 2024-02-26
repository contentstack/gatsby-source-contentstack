"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCslpMetaPaths = getCslpMetaPaths;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function getCslpMetaPaths(selectionSet) {
  var _schema$field_metadat;
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var schema = arguments.length > 2 ? arguments[2] : undefined;
  var fragments = arguments.length > 3 ? arguments[3] : undefined;
  var contentTypeMap = arguments.length > 4 ? arguments[4] : undefined;
  var typePrefix = arguments.length > 5 ? arguments[5] : undefined;
  var paths = {
    referencePaths: [],
    jsonRtePaths: []
  };
  var refPaths = paths.referencePaths;
  var rtePaths = paths.jsonRtePaths;
  if (schema.data_type === "reference" && path) {
    refPaths.push(path);
  }
  if (schema.data_type === "json" && (_schema$field_metadat = schema.field_metadata) !== null && _schema$field_metadat !== void 0 && _schema$field_metadat.allow_json_rte) {
    rtePaths.push(path);
  }
  if (!selectionSet || !selectionSet.selections) {
    return paths;
  }
  var _iterator = _createForOfIteratorHelper(selectionSet.selections),
    _step;
  try {
    var _loop = function _loop() {
      var _selection$name;
      var selection = _step.value;
      // exit when selection.kind is not Field, SelectionSet or InlineFragment
      // selection.name is not present for selection.kind is "InlineFragment"
      if ((selection === null || selection === void 0 ? void 0 : (_selection$name = selection.name) === null || _selection$name === void 0 ? void 0 : _selection$name.value) === "cslp__meta") {
        return "continue";
      }
      if (selection.selectionSet || selection.kind === "Field" || selection.kind === "InlineFragment" || selection.kind === "FragmentSpread") {
        var _selection$name2, _selection$typeCondit, _selection$typeCondit2;
        var fragmentName = (_selection$name2 = selection.name) === null || _selection$name2 === void 0 ? void 0 : _selection$name2.value;
        var fragmentDefinition = fragments[fragmentName];
        var inlineFragmentNodeType = (_selection$typeCondit = selection.typeCondition) === null || _selection$typeCondit === void 0 ? void 0 : (_selection$typeCondit2 = _selection$typeCondit.name) === null || _selection$typeCondit2 === void 0 ? void 0 : _selection$typeCondit2.value;

        // Fragment
        // note - when a fragment is used inside a reference field, the reference field
        // path gets added twice, this can maybe avoided by re-structuring the code, 
        // but a Set works fine
        if (selection.kind === "FragmentSpread" && fragmentDefinition) {
          var fragmentSpreadPaths = getCslpMetaPaths(fragmentDefinition.selectionSet, path, schema, fragments, contentTypeMap, typePrefix);
          combineCslpMetaPaths(fragmentSpreadPaths, paths);
        }
        // InlineFragment (ref_multiple)
        else if (selection.kind === "InlineFragment" && inlineFragmentNodeType) {
          var contentTypeUid = inlineFragmentNodeType.replace("".concat(typePrefix, "_"), "");
          if (!contentTypeUid || !(contentTypeUid in contentTypeMap)) {
            return {
              v: paths
            };
          }
          var contentTypeSchema = contentTypeMap[contentTypeUid];
          var inlineFragmentPaths = getCslpMetaPaths(selection.selectionSet, path, contentTypeSchema, fragments, contentTypeMap, typePrefix);
          combineCslpMetaPaths(inlineFragmentPaths, paths);
        }
        // SelectionSet (all fields that can have nested properties)
        else {
          var _schema$blocks;
          var nestedFields = (_schema$blocks = schema === null || schema === void 0 ? void 0 : schema.blocks) !== null && _schema$blocks !== void 0 ? _schema$blocks : schema.schema;
          // cannot traverse inside file or link schema
          if (schema.data_type === "file" || schema.data_type === "link") {
            return {
              v: paths
            };
          }
          // when a reference, change nested fields to schema of referenced CT
          if (schema.data_type === "reference" && schema.reference_to) {
            nestedFields = contentTypeMap[schema.reference_to[0]].schema;
          }
          var nestedFieldSchema = nestedFields.find(function (item) {
            return item.uid === selection.name.value;
          });
          if (nestedFieldSchema) {
            var nextPath = [];
            if (path) {
              nextPath = path.split(".");
            }
            nextPath.push(selection.name.value);
            var metaPaths = getCslpMetaPaths(selection.selectionSet, nextPath.join("."), nestedFieldSchema, fragments, contentTypeMap, typePrefix);
            combineCslpMetaPaths(metaPaths, paths);
          }
        }
      }
    };
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _ret = _loop();
      if (_ret === "continue") continue;
      if ((0, _typeof2["default"])(_ret) === "object") return _ret.v;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return {
    referencePaths: Array.from(new Set(paths.referencePaths)),
    jsonRtePaths: Array.from(new Set(paths.jsonRtePaths))
  };
}

/**
 * @typedef {{referencePaths: string[], jsonRtePaths: string[]}} paths
 * @param {paths} source 
 * @param {paths} target 
 * @returns merges the path fields from the source into the target's path fields
 */
function combineCslpMetaPaths(source, target) {
  var _target$referencePath, _target$jsonRtePaths;
  (_target$referencePath = target.referencePaths).push.apply(_target$referencePath, (0, _toConsumableArray2["default"])(source.referencePaths));
  (_target$jsonRtePaths = target.jsonRtePaths).push.apply(_target$jsonRtePaths, (0, _toConsumableArray2["default"])(source.jsonRtePaths));
  return target;
}
//# sourceMappingURL=getCslpMetaPaths.js.map