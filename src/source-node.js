'use strict';

const { checkIfUnsupportedFormat, SUPPORTED_FILES_COUNT, IMAGE_REGEXP, CODES, getContentTypeOption, ASSET_NODE_UIDS } = require('./utils');
const downloadAssets = require('./download-assets');
const { deleteContentstackNodes } = require('./node-helper');
const { fetchData } = require('./fetch');
const { normalizeEntry, processContentType, processEntry, processAsset, makeEntryNodeUid, makeAssetNodeUid } = require('./normalize');

exports.sourceNodes = async ({ cache, actions, getNode, getNodes, createNodeId, reporter, createContentDigest, getNodesByType, getCache }, configOptions) => {
  const { createNode, deleteNode, touchNode, createNodeField } = actions;
  // use a custom type prefix if specified
  const typePrefix = configOptions.type_prefix || 'Contentstack';

  let contentstackData;
  try {
    const contentTypeOption = getContentTypeOption(configOptions);
    const { contentstackData: _contentstackData } = await fetchData(configOptions, reporter, cache, contentTypeOption);
    contentstackData = _contentstackData;
    contentstackData.contentTypes = await cache.get(typePrefix);
  } catch (error) {
    reporter.panic({
      id: CODES.SyncError,
      context: { sourceMessage: `Error occurred while fetching contentstack in [sourceNodes]. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.` },
      error
    });
    throw error;
  }

  const syncData = contentstackData.syncData.reduce((merged, item) => {
    if (!merged[item.type]) {
      merged[item.type] = [];
    }
    merged[item.type].push(item);
    return merged;
  }, {});

  // for checking if the reference node is present or not
  const entriesNodeIds = new Set();
  const assetsNodeIds = new Set();

  const existingNodes = getNodes().filter(n => n.internal.owner === 'gatsby-source-contentstack');

  existingNodes.forEach(n => {
    if (n.internal.type !== `${typePrefix}ContentTypes` && n.internal.type !== `${typePrefix}_assets`) {
      entriesNodeIds.add(n.id);
    }
    if (n.internal.type === `${typePrefix}_assets`) {
      assetsNodeIds.add(n.id);
    }
    touchNode(n);
  });

  syncData.entry_published &&
    syncData.entry_published.forEach(item => {
      const entryNodeId = makeEntryNodeUid(item.data, createNodeId, typePrefix);
      entriesNodeIds.add(entryNodeId);
    });

  let countOfSupportedFormatFiles = 0, assetUids = [];
  syncData.asset_published && syncData.asset_published.forEach(function (item) {
    /**
     * Get the count of assets (images), filtering out svg and gif format, as these formats are not supported by gatsby-image.
     * We need the right count to render in progress bar, which will show progress for downloading remote files.
     */
    if (configOptions.downloadImages) {
      let matches, isUnsupportedExt;
      try {
        matches = IMAGE_REGEXP.exec(item.data.url);
        isUnsupportedExt = checkIfUnsupportedFormat(item.data.url);

        if (matches && !isUnsupportedExt) countOfSupportedFormatFiles++;
      } catch (error) {
        reporter.panic('Something went wrong. Details: ', error);
      }
    }
    var assetNodeId = makeAssetNodeUid(item.data, createNodeId, typePrefix);
    assetsNodeIds.add(assetNodeId);
    assetUids.push(assetNodeId);
  });
  await cache.set(ASSET_NODE_UIDS, assetUids);
  // Cache the found count
  configOptions.downloadImages && await cache.set(SUPPORTED_FILES_COUNT, countOfSupportedFormatFiles);

  // adding nodes
  const contentTypesMap = {};
  contentstackData.contentTypes.forEach(contentType => {
    contentType.uid = contentType.uid.replace(/-/g, '_');
    const contentTypeNode = processContentType(contentType, createNodeId, createContentDigest, typePrefix);
    contentTypesMap[contentType.uid] = contentType;
    createNode(contentTypeNode);
  });

  syncData.entry_published && syncData.entry_published.forEach(item => {
    item.content_type_uid = item.content_type_uid.replace(/-/g, '_');
    const contentType = contentTypesMap[item.content_type_uid];
    const normalizedEntry = normalizeEntry(contentType, item.data, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions);
    const entryNode = processEntry(contentType, normalizedEntry, createNodeId, createContentDigest, typePrefix);
    createNode(entryNode);
  });

  syncData.asset_published && syncData.asset_published.forEach(item => {
    const assetNode = processAsset(item.data, createNodeId, createContentDigest, typePrefix);
    createNode(assetNode);
  });

  if (configOptions.downloadImages) {
    await downloadAssets({ cache, getCache, createNode, createNodeId, getNodesByType, reporter, createNodeField, getNode, }, typePrefix, configOptions);
  }

  // deleting nodes
  syncData.entry_unpublished && syncData.entry_unpublished.forEach(item => deleteContentstackNodes(item.data, 'entry', createNodeId, getNode, deleteNode, typePrefix));

  syncData.asset_unpublished && syncData.asset_unpublished.forEach(item => deleteContentstackNodes(item.data, 'asset', createNodeId, getNode, deleteNode, typePrefix));

  syncData.entry_deleted && syncData.entry_deleted.forEach(item => deleteContentstackNodes(item.data, 'entry', createNodeId, getNode, deleteNode, typePrefix));

  syncData.asset_deleted && syncData.asset_deleted.forEach(item => deleteContentstackNodes(item.data, 'asset', createNodeId, getNode, deleteNode, typePrefix));

  syncData.content_type_deleted &&
    syncData.content_type_deleted.forEach(item => {
      item.content_type_uid = item.content_type_uid.replace(/-/g, '_');
      const sameContentTypeNodes = getNodes().filter(
        n => n.internal.type === `${typePrefix}_${item.content_type_uid}`
      );
      sameContentTypeNodes.forEach(node => deleteNode(node));
    });
};