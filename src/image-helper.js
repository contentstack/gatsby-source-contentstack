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
    width: options.width || undefined,
    height: options.height || undefined,
    format: options.toFormat,
    quality: options.quality || undefined,
    crop: options.crop || undefined,
    fit: options.resizingBehavior || undefined,
    'bg-color': options.background || undefined,
  };

  const searchParams = new URLSearchParams();
  for (const key in queryParams) {
    if (typeof queryParams[key] !== 'undefined') {
      searchParams.append(key, queryParams[key] ?? '');
    }
  }
  // {base_url}/v3/assets/{stack_api_key}/{asset_uid}/{version_uid}/filename
  // https://images.contentstack.io/v3/assets/blteae40eb499811073/bltc5064f36b5855343/59e0c41ac0eddd140d5a8e3e/owl.jpg?format={format}
  return `${imgUrl}?${searchParams.toString()}`;
};

exports.mimeTypeExtensions = mimeTypeExtensions;
exports.validImageFormats = validImageFormats;
exports.isImage = isImage;
exports.createUrl = createUrl;