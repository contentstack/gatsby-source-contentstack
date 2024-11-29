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
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
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