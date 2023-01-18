'use strict';

var _require = require('url'),
  URLSearchParams = _require.URLSearchParams;

// Determine the proper file extension based on mime type
var mimeTypeExtensions = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/png': '.png',
  'image/webp': '.webp'
};

// Supported image formats by contentstack image API
var validImageFormats = ['jpg', 'png', 'webp', 'gif'];
var isImage = function isImage(image) {
  return !!mimeTypeExtensions[image === null || image === void 0 ? void 0 : image.content_type];
};

// Creates a Contentstack image url
var createUrl = function createUrl(imgUrl) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var queryParams = {
    width: options.width,
    height: options.height,
    format: options.toFormat,
    quality: options.quality,
    crop: options.crop,
    fit: options.fit,
    trim: options.trim,
    pad: options.pad,
    'bg-color': options.background
  };
  var searchParams = new URLSearchParams();
  for (var key in queryParams) {
    if (typeof queryParams[key] !== 'undefined') {
      var _queryParams$key;
      searchParams.append(key, (_queryParams$key = queryParams[key]) !== null && _queryParams$key !== void 0 ? _queryParams$key : '');
    }
  }
  return "".concat(imgUrl, "?").concat(searchParams.toString());
};
exports.mimeTypeExtensions = mimeTypeExtensions;
exports.validImageFormats = validImageFormats;
exports.isImage = isImage;
exports.createUrl = createUrl;
//# sourceMappingURL=image-helper.js.map