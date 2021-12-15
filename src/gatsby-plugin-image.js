'use strict';

const { fetchRemoteFile } = require('gatsby-core-utils');
const { readFile } = require('fs').promises;

const { createUrl, mimeTypeExtensions, validImageFormats, isImage } = require('./image-helper');

const unresolvedBase64Cache = {};
const resolvedBase64Cache = {};

const getBase64Image = exports.getBase64Image = (props, cache) => {
  const { aspectRatio } = props;
  const originalFormat = props.image.content_type.split('/')[1];
  const toFormat = props.options.toFormat;
  const imageOptions = {
    ...props.options,
    toFormat,
    width: 20,
    height: Math.floor(20 * aspectRatio),
  };

  const csImageUrl = createUrl(props.baseUrl, imageOptions);

  const resolvedUrl = resolvedBase64Cache[csImageUrl];
  if (resolvedUrl) {
    return resolvedUrl;
  }

  const inflightUrl = unresolvedBase64Cache[csImageUrl];
  if (inflightUrl) {
    return inflightUrl;
  }

  const loadImage = async () => {
    const { content_type } = props.image;
    const extension = mimeTypeExtensions[content_type];
    const absolutePath = await fetchRemoteFile({
      url: csImageUrl,
      cache,
      ext: extension,
    });
    const base64 = (await readFile(absolutePath)).toString('base64');
    return `data:image/${toFormat || originalFormat};base64,${base64}`;
  };

  const promise = loadImage();
  unresolvedBase64Cache[csImageUrl] = promise;

  return promise.then(body => {
    delete unresolvedBase64Cache[csImageUrl];
    resolvedBase64Cache[csImageUrl] = body;
  }).catch(error => {
    // TODO: add a logger here.
  });
};

function getBasicImageProps(image, args) {
  let aspectRatio;
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
  const {
    quality,
    crop,
    backgroundColor,
    fit,
  } = imageTransformOptions;

  if (!validImageFormats.includes(toFormat)) {
    console.warn(`[gatsby-source-contentstack] Invalid image format "${toFormat}". Supported types are ${validImageFormats.join(', ')}`);
    return;
  }

  const src = createUrl(filename, {
    width, height, toFormat, fit,
    background: backgroundColor?.replace('#', 'rgb:'),
    quality, crop, trim, pad,
  });

  return { width, height, format: toFormat, src };
}

exports.resolveGatsbyImageData = async (image, options, context, info, { cache }) => {
  if (!isImage(image)) return null;

  const { generateImageData } = await import('gatsby-plugin-image');

  const { baseUrl, contentType, width, height } = getBasicImageProps(image, options);

  let [, format] = contentType.split('/');
  if (format === 'jpeg') {
    format = 'jpg';
  }

  const imageProps = generateImageData({
    ...options,
    pluginName: 'gatsby-source-contentstack',
    sourceMetadata: { width, height, format },
    filename: baseUrl,
    generateImageSource,
    options,
  });

  let placeholderDataURI = null;

  if (options.placeholder === 'blurred') {
    placeholderDataURI = await getBase64Image({ baseUrl, image, options }, cache);
  }

  if (placeholderDataURI) {
    imageProps.placeholder = { fallback: placeholderDataURI };
  }

  return imageProps;
}