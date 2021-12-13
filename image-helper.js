'use strict';

var _require = require('url'),
    URLSearchParams = _require.URLSearchParams; // Determine the proper file extension based on mime type


var mimeTypeExtensions = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/png': '.png',
  'image/webp': '.webp'
}; // Supported image formats by contentstack image API

var validImageFormats = ['jpg', 'png', 'webp', 'gif'];

var isImage = function isImage(image) {
  return !!mimeTypeExtensions[image === null || image === void 0 ? void 0 : image.content_type];
}; // Creates a Contentstack image url


var createUrl = function createUrl(imgUrl) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // If radius is -1, we need to pass max to the API.
  var cornerRadius = options.cornerRadius === -1 ? 'max' : options.cornerRadius; // Convert to Contentstack names and filter out undefined/null values.

  var urlArgs = {
    w: options.width || undefined,
    h: options.height || undefined,
    fl: options.toFormat === 'jpg' && options.jpegProgressive ? 'progressive' : undefined,
    q: options.quality || undefined,
    fm: options.toFormat || undefined,
    fit: options.resizingBehavior || undefined,
    f: options.background || undefined,
    bg: options.background || undefined,
    r: cornerRadius || undefined
  };
  var searchParams = new URLSearchParams();

  for (var key in urlArgs) {
    if (typeof urlArgs[key] !== 'undefined') {
      var _urlArgs$key;

      searchParams.append(key, (_urlArgs$key = urlArgs[key]) !== null && _urlArgs$key !== void 0 ? _urlArgs$key : '');
    }
  }

  return "https://".concat(imgUrl, "?").concat(searchParams.toString());
};

exports.mimeTypeExtensions = mimeTypeExtensions;
exports.validImageFormats = validImageFormats;
exports.isImage = isImage;
exports.createUrl = createUrl;