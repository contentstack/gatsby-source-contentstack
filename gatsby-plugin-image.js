'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var _require = require('gatsby-core-utils'),
    fetchRemoteFile = _require.fetchRemoteFile;

var _require2 = require('fs'),
    readFile = _require2.readFile;

var _require3 = require('./image-helper'),
    createUrl = _require3.createUrl,
    mimeTypeExtensions = _require3.mimeTypeExtensions,
    validImageFormats = _require3.validImageFormats,
    isImage = _require3.isImage;

var unresolvedBase64Cache = {};
var resolvedBase64Cache = {};

var getBase64Image = exports.getBase64Image = function (props, cache) {
  var aspectRatio = props.aspectRatio;
  var originalFormat = props.image.file.contentType.split('/')[1];
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
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var contentType, extension, absolutePath, base64;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              contentType = props.image.file.contentType;
              extension = mimeTypeExtensions[contentType];
              _context.next = 4;
              return fetchRemoteFile({
                url: csImageUrl,
                cache: cache,
                ext: extension
              });

            case 4:
              absolutePath = _context.sent;
              _context.next = 7;
              return readFile(absolutePath).toString('base64');

            case 7:
              base64 = _context.sent;
              return _context.abrupt("return", "data:image/".concat(toFormat || originalFormat, ";base64,").concat(base64));

            case 9:
            case "end":
              return _context.stop();
          }
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
  });
};

function getBasicImageProps(image, args) {
  var aspectRatio;

  if (args.width && args.height) {
    aspectRatio = args.width / args.height;
  } else {
    aspectRatio = image.file.details.image.width / image.file.details.image.height;
  }

  return {
    baseUrl: image.file.url,
    contentType: image.file.contentType,
    aspectRatio: aspectRatio,
    width: image.file.details.image.width,
    height: image.file.details.image.height
  };
} // Generate image source data for gatsby-plugin-image


function generateImageSource(filename, width, height, toFormat, imageTransformOptions) {
  var jpegProgressive = imageTransformOptions.jpegProgressive,
      quality = imageTransformOptions.quality,
      cropFocus = imageTransformOptions.cropFocus,
      backgroundColor = imageTransformOptions.backgroundColor,
      resizingBehavior = imageTransformOptions.resizingBehavior,
      cornerRadius = imageTransformOptions.cornerRadius;

  if (!validImageFormats.includes(toFormat)) {
    console.warn("[gatsby-source-contentstack] Invalid image format \"".concat(toFormat, "\". Supported types are ").concat(validImageFormats.join(', ')));
    return;
  }

  var src = createUrl(filename, {
    width: width,
    height: height,
    toFormat: toFormat,
    resizingBehavior: resizingBehavior,
    background: backgroundColor === null || backgroundColor === void 0 ? void 0 : backgroundColor.replace('#', 'rgb:'),
    quality: quality,
    jpegProgressive: jpegProgressive,
    cropFocus: cropFocus,
    cornerRadius: cornerRadius
  });
  return {
    width: width,
    height: height,
    format: toFormat,
    src: src
  };
}

exports.resolveGatsbyImageData = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(image, options, context, info, _ref3) {
    var cache, _yield$import, generateImageData, _getBasicImageProps, baseUrl, contentType, width, height, _contentType$split, _contentType$split2, format, imageProps, placeholderDataURI;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            cache = _ref3.cache;

            if (isImage(image)) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt("return", null);

          case 3:
            _context2.next = 5;
            return Promise.resolve().then(function () {
              return _interopRequireWildcard(require('gatsby-plugin-image'));
            });

          case 5:
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
              _context2.next = 16;
              break;
            }

            _context2.next = 15;
            return getBase64Image({
              baseUrl: baseUrl,
              image: image,
              options: options
            }, cache);

          case 15:
            placeholderDataURI = _context2.sent;

          case 16:
            if (placeholderDataURI) {
              imageProps.placeholder = {
                fallback: placeholderDataURI
              };
            }

            return _context2.abrupt("return", imageProps);

          case 18:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x, _x2, _x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();