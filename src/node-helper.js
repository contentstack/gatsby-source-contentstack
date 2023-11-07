'use strict';
/*
  `node-fetch` have different export depending on CJS or ESM
  context - requiring CJS (regular build) will return a function directly,
  requiring ESM (what is currently being bundled for rendering engines
  which are used by DSG) will return object with `default` field which is
  a function. `preferDefault` helper will just use `.default` if available,
  but will fallback to entire export if not available
*/
const preferDefault = m => (m && m.default) || m;
const fetch = preferDefault(require('node-fetch'));

const deleteContentstackNodes = (
  item,
  type,
  createNodeId,
  getNode,
  deleteNode,
  typePrefix
) => {
  let nodeId = '';
  let node = null;
  if (type === 'entry') {
    nodeId = createNodeId(
      `${typePrefix.toLowerCase()}-entry-${item.uid}-${item.locale}`
    );
  }
  if (type === 'asset') {
    nodeId = createNodeId(
      `${typePrefix.toLowerCase()}-assets-${item.uid}-${item.locale}`
    );
  }
  node = getNode(nodeId);
  if (node) {
    deleteNode(node);
  }
};

const validateContentstackAccess = async pluginOptions => {
  if (process.env.NODE_ENV === `test`) return undefined;

  let host = pluginOptions.cdn
    ? pluginOptions.cdn
    : 'https://cdn.contentstack.io/v3';
  await fetch(`${host}/content_types?include_count=false`, {
    headers: {
      api_key: `${pluginOptions.api_key}`,
      access_token: `${pluginOptions.delivery_token}`,
      branch: pluginOptions?.branch,
    },
  })
    .then(res => res.ok)
    .then(ok => {
      if (!ok)
        throw new Error(
          `Cannot access Contentstack with api_key=${pluginOptions.api_key} & delivery_token=${pluginOptions.delivery_token}.`
        );
    });

  return undefined;
};

exports.deleteContentstackNodes = deleteContentstackNodes;
exports.validateContentstackAccess = validateContentstackAccess;
