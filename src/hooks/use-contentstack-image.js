import { getImageData } from 'gatsby-plugin-image';
import { useMemo } from 'react';
import { createUrl } from '../image-helper';

export function useContentstackImage(image, options) {
  return useMemo(
    () =>
      getImageData({
        baseUrl: image.url,
        height: options?.height,
        width: options?.width,
        formats: options?.formats,
        sourceWidth: image?.width,
        sourceHeight: image?.height,
        layout: options?.layout,
        urlBuilder: ({ baseUrl, options, height, width, format }) => {
          return createUrl(baseUrl, {
            ...options,
            height,
            width,
            toFormat: format,
          });
        },
        pluginName: 'gatsby-source-contentstack',
        // these options are internally passed to urlBuilder
        options: options,
      }),
    [image, options]
  );
}
