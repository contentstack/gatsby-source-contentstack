'use strict';

const { URLSearchParams } = require('url');

// Determine the proper file extension based on mime type
const mimeTypeExtensions = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/png': '.png',
  'image/webp': '.webp',
};

// Supported image formats by contentstack image API
const validImageFormats = ['jpg', 'png', 'webp', 'gif'];

const isImage = image => !!mimeTypeExtensions[image?.file?.contentType];

// Creates a Contentstack image url
const createUrl = (imgUrl, options = {}) => {
  // If radius is -1, we need to pass max to the API.
  const cornerRadius = options.cornerRadius === -1 ? 'max' : options.cornerRadius;

  // Convert to Contentstack names and filter out undefined/null values.
  const urlArgs = {
    w: options.width || undefined,
    h: options.height || undefined,
    fl: options.toFormat === 'jpg' && options.jpegProgressive ? 'progressive' : undefined,
    q: options.quality || undefined,
    fm: options.toFormat || undefined,
    fit: options.resizingBehavior || undefined,
    f: options.background || undefined,
    bg: options.background || undefined,
    r: cornerRadius || undefined,
  };

  const searchParams = new URLSearchParams();
  for (const key in urlArgs) {
    if (typeof urlArgs[key] !== 'undefined') {
      searchParams.append(key, urlArgs[key] ?? '');
    }
  }

  return `https://${imgUrl}?${searchParams.toString()}`;
};

exports.mimeTypeExtensions = mimeTypeExtensions;
exports.validImageFormats = validImageFormats;
exports.isImage = isImage;
exports.createUrl = createUrl;