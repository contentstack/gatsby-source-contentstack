'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var _require = require('gatsby-core-utils'),
  fetchRemoteFile = _require.fetchRemoteFile;
var readFile = require('fs').promises.readFile;
var _require2 = require('./image-helper'),
  createUrl = _require2.createUrl,
  mimeTypeExtensions = _require2.mimeTypeExtensions,
  validImageFormats = _require2.validImageFormats,
  isImage = _require2.isImage;
var _require3 = require('./utils'),
  CODES = _require3.CODES;
var unresolvedBase64Cache = {};
var resolvedBase64Cache = {};
var getBase64Image = exports.getBase64Image = function (props, cache, reporter) {
  var aspectRatio = props.aspectRatio;
  var originalFormat = props.image.content_type.split('/')[1];
  var toFormat = props.options.toFormat;
  var imageOptions = _objectSpread(_objectSpread({}, props.options), {}, {
    toFormat: toFormat,
    width: 20,
    height: Math.floor(20 * aspectRatio)
  });
  var csImageUrl = createUrl(props.baseUrl, imageOptions);
  var resolvedUrl = resolvedBase64Cache[csImageUrl];
  if (resolvedUrl) {
    return resolvedUrl;
  }
  var inflightUrl = unresolvedBase64Cache[csImageUrl];
  if (inflightUrl) {
    return inflightUrl;
  }
  var loadImage = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var content_type, extension, absolutePath, base64;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            content_type = props.image.content_type;
            extension = mimeTypeExtensions[content_type];
            _context.next = 4;
            return fetchRemoteFile({
              url: csImageUrl,
              cache: cache,
              ext: extension
            });
          case 4:
            absolutePath = _context.sent;
            _context.next = 7;
            return readFile(absolutePath);
          case 7:
            base64 = _context.sent.toString('base64');
            return _context.abrupt("return", "data:image/".concat(toFormat || originalFormat, ";base64,").concat(base64));
          case 9:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function loadImage() {
      return _ref.apply(this, arguments);
    };
  }();
  var promise = loadImage();
  unresolvedBase64Cache[csImageUrl] = promise;
  return promise.then(function (body) {
    delete unresolvedBase64Cache[csImageUrl];
    resolvedBase64Cache[csImageUrl] = body;
  })["catch"](function (error) {
    reporter.panic({
      id: CODES.ImageAPIError,
      context: {
        sourceMessage: "Error occurred while fetching image. Please find the image url here: ".concat(props.baseUrl)
      },
      error: error
    });
  });
};
function getBasicImageProps(image, args) {
  var aspectRatio;
  if (args.width && args.height) {
    aspectRatio = args.width / args.height;
  } else {
    aspectRatio = image.dimension.width / image.dimension.height;
  }
  return {
    baseUrl: image.url,
    contentType: image.content_type,
    aspectRatio: aspectRatio,
    width: image.dimension.width,
    height: image.dimension.height
  };
}

// Generate image source data for gatsby-plugin-image
function generateImageSource(filename, width, height, toFormat, _fit, imageTransformOptions) {
  var quality = imageTransformOptions.quality,
    crop = imageTransformOptions.crop,
    backgroundColor = imageTransformOptions.backgroundColor,
    fit = imageTransformOptions.fit,
    trim = imageTransformOptions.trim,
    pad = imageTransformOptions.pad;
  if (!validImageFormats.includes(toFormat)) {
    console.warn("[gatsby-source-contentstack] Invalid image format \"".concat(toFormat, "\". Supported types are ").concat(validImageFormats.join(', ')));
    return;
  }
  var src = createUrl(filename, {
    width: width,
    height: height,
    toFormat: toFormat,
    fit: fit,
    background: backgroundColor === null || backgroundColor === void 0 ? void 0 : backgroundColor.replace('#', 'rgb:'),
    quality: quality,
    crop: crop,
    trim: trim,
    pad: pad
  });
  return {
    width: width,
    height: height,
    format: toFormat,
    src: src
  };
}
exports.resolveGatsbyImageData = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(function (_ref3) {
    var image = _ref3.image,
      options = _ref3.options,
      cache = _ref3.cache,
      reporter = _ref3.reporter;
    return /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var _yield$import, generateImageData, _getBasicImageProps, baseUrl, contentType, width, height, _contentType$split, _contentType$split2, format, imageProps, placeholderDataURI;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            if (isImage(image)) {
              _context2.next = 2;
              break;
            }
            return _context2.abrupt("return", null);
          case 2:
            _context2.next = 4;
            return Promise.resolve().then(function () {
              return _interopRequireWildcard(require('gatsby-plugin-image'));
            });
          case 4:
            _yield$import = _context2.sent;
            generateImageData = _yield$import.generateImageData;
            _getBasicImageProps = getBasicImageProps(image, options), baseUrl = _getBasicImageProps.baseUrl, contentType = _getBasicImageProps.contentType, width = _getBasicImageProps.width, height = _getBasicImageProps.height;
            _contentType$split = contentType.split('/'), _contentType$split2 = (0, _slicedToArray2["default"])(_contentType$split, 2), format = _contentType$split2[1];
            if (format === 'jpeg') {
              format = 'jpg';
            }
            imageProps = generateImageData(_objectSpread(_objectSpread({}, options), {}, {
              pluginName: 'gatsby-source-contentstack',
              sourceMetadata: {
                width: width,
                height: height,
                format: format
              },
              filename: baseUrl,
              generateImageSource: generateImageSource,
              options: options
            }));
            placeholderDataURI = null;
            if (!(options.placeholder === 'blurred')) {
              _context2.next = 15;
              break;
            }
            _context2.next = 14;
            return getBase64Image({
              baseUrl: baseUrl,
              image: image,
              options: options
            }, cache, reporter);
          case 14:
            placeholderDataURI = _context2.sent;
          case 15:
            if (placeholderDataURI) {
              imageProps.placeholder = {
                fallback: placeholderDataURI
              };
            }
            return _context2.abrupt("return", imageProps);
          case 17:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    })();
  });
  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();
//# sourceMappingURL=gatsby-plugin-image.js.map