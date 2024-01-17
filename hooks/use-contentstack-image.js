"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useContentstackImage = useContentstackImage;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _gatsbyPluginImage = require("gatsby-plugin-image");
var _react = require("react");
var _imageHelper = require("../image-helper");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function useContentstackImage(image, options) {
  return (0, _react.useMemo)(function () {
    return (0, _gatsbyPluginImage.getImageData)({
      baseUrl: image.url,
      height: options === null || options === void 0 ? void 0 : options.height,
      width: options === null || options === void 0 ? void 0 : options.width,
      formats: options === null || options === void 0 ? void 0 : options.formats,
      sourceWidth: image === null || image === void 0 ? void 0 : image.width,
      sourceHeight: image === null || image === void 0 ? void 0 : image.height,
      layout: options === null || options === void 0 ? void 0 : options.layout,
      urlBuilder: function urlBuilder(_ref) {
        var baseUrl = _ref.baseUrl,
          options = _ref.options,
          height = _ref.height,
          width = _ref.width,
          format = _ref.format;
        return (0, _imageHelper.createUrl)(baseUrl, _objectSpread(_objectSpread({}, options), {}, {
          height: height,
          width: width,
          toFormat: format
        }));
      },
      pluginName: 'gatsby-source-contentstack',
      // these options are internally passed to urlBuilder
      options: options
    });
  }, [image, options]);
}
//# sourceMappingURL=use-contentstack-image.js.map