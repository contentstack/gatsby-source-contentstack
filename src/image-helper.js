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

const isImage = image => !!mimeTypeExtensions[image?.content_type];

// Creates a Contentstack image url
const createUrl = (imgUrl, options = {}) => {
  const queryParams = {
    width: options.width,
    height: options.height,
    format: options.toFormat,
    quality: options.quality,
    crop: options.crop,
    fit: options.fit,
    'bg-color': options.background,
  };

  const searchParams = new URLSearchParams();
  for (const key in queryParams) {
    if (typeof queryParams[key] !== 'undefined') {
      searchParams.append(key, queryParams[key] ?? '');
    }
  }
  return `${imgUrl}?${searchParams.toString()}`;
};

exports.mimeTypeExtensions = mimeTypeExtensions;
exports.validImageFormats = validImageFormats;
exports.isImage = isImage;
exports.createUrl = createUrl;