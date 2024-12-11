'use strict';

const { checkIfUnsupportedFormat, SUPPORTED_FILES_COUNT, IMAGE_REGEXP, CODES, getContentTypeOption, ASSET_NODE_UIDS } = require('./utils');
const downloadAssets = require('./download-assets');
const { deleteContentstackNodes } = require('./node-helper');
const { fetchData, fetchTaxonomies } = require('./fetch'); // Kept this import for taxonomy fetching
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

  // Check for taxonomy presence dynamically in content types
  const hasTaxonomies = contentstackData.contentTypes.some((contentType) =>
    contentType.schema.some((field) => field.data_type === 'taxonomy')
  );

  if (hasTaxonomies) {
    try {
      reporter.info('Fetching taxonomies...');
      console.log('Fetching taxonomies with configOptions:', configOptions);
      const taxonomies = await fetchTaxonomies(configOptions);
      console.log('Fetched taxonomies:', taxonomies);

      await Promise.all(
        taxonomies.map(async (taxonomy) => {
          const taxonomyNode = {
            ...taxonomy,
            id: createNodeId(`${taxonomy.uid}`),
            parent: null,
            children: [],
            internal: {
              type: `${typePrefix}Taxonomy`,
              contentDigest: createContentDigest(taxonomy),
            },
          };

          await createNode(taxonomyNode);
          reporter.info(`Created taxonomy node: ${taxonomy.uid}`);
        })
      );

      reporter.info('Taxonomy nodes created.');
    } catch (error) {
      console.log('Error fetching taxonomies:', error);
      reporter.warn(`Failed to fetch or create taxonomies. Error: ${error.message}`);
    }
  } else {
    reporter.info('No taxonomies found in content types. Skipping taxonomy processing.');
  }

  console.log('Starting to process existing nodes...');


  // For checking if the reference node is present or not
  const entriesNodeIds = new Set();
  const assetsNodeIds = new Set();

  const existingNodes = getNodes().filter(n => n.internal.owner === 'gatsby-source-contentstack');
  console.log('Existing nodes:', existingNodes.length);

  existingNodes.forEach(n => {
    if (n.internal.type !== `${typePrefix}ContentTypes` && n.internal.type !== `${typePrefix}_assets`) {
      entriesNodeIds.add(n.id);
    }
    if (n.internal.type === `${typePrefix}_assets`) {
      assetsNodeIds.add(n.id);
    }
    touchNode(n);
  });
  console.log('Existing nodes processed.');

  syncData.entry_published && syncData.entry_published.forEach(item => {
    const entryNodeId = makeEntryNodeUid(item.data, createNodeId, typePrefix);
    entriesNodeIds.add(entryNodeId);
  });
  console.log('Entry published nodes processed.');

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
  console.log('Asset published nodes processed.');

  await cache.set(ASSET_NODE_UIDS, assetUids);
  console.log('Asset UIDs cached.');

  // Cache the found count
  configOptions.downloadImages && await cache.set(SUPPORTED_FILES_COUNT, countOfSupportedFormatFiles);
  console.log('Supported files count cached.');

  const contentTypesMap = {};
  contentstackData.contentTypes.forEach(contentType => {
    contentType.uid = contentType.uid.replace(/-/g, '_');
    const contentTypeNode = processContentType(contentType, createNodeId, createContentDigest, typePrefix);
    contentTypesMap[contentType.uid] = contentType;
    createNode(contentTypeNode);
  });
  console.log('Content types processed.');

  syncData.entry_published && syncData.entry_published.forEach(item => {
    item.content_type_uid = item.content_type_uid.replace(/-/g, '_');
    const contentType = contentTypesMap[item.content_type_uid];
    const normalizedEntry = normalizeEntry(contentType, item.data, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions);
    const entryNode = processEntry(contentType, normalizedEntry, createNodeId, createContentDigest, typePrefix);
    createNode(entryNode);
  });
  console.log('Entry nodes created.');

  syncData.asset_published && syncData.asset_published.forEach(item => {
    const assetNode = processAsset(item.data, createNodeId, createContentDigest, typePrefix);
    createNode(assetNode);
  });
  console.log('Asset nodes created.');

  if (configOptions.downloadImages) {
    console.log('Starting to download assets...');

    await downloadAssets({ cache, getCache, createNode, createNodeId, getNodesByType, reporter, createNodeField, getNode, }, typePrefix, configOptions);
  }

  // deleting nodes
  console.log('Deleting unpublished entry nodes...');
  syncData.entry_unpublished && syncData.entry_unpublished.forEach(item => deleteContentstackNodes(item.data, 'entry', createNodeId, getNode, deleteNode, typePrefix));
  console.log('Entry unpublished nodes deleted.');

  console.log('Deleting unpublished asset nodes...');
  syncData.asset_unpublished && syncData.asset_unpublished.forEach(item => deleteContentstackNodes(item.data, 'asset', createNodeId, getNode, deleteNode, typePrefix));
  console.log('Asset unpublished nodes deleted.');

  console.log('Deleting deleted entry nodes...');
  syncData.entry_deleted && syncData.entry_deleted.forEach(item => deleteContentstackNodes(item.data, 'entry', createNodeId, getNode, deleteNode, typePrefix));
  console.log('Entry deleted nodes deleted.');

  console.log('Deleting deleted asset nodes...');
  syncData.asset_deleted && syncData.asset_deleted.forEach(item => deleteContentstackNodes(item.data, 'asset', createNodeId, getNode, deleteNode, typePrefix));
  console.log('Asset deleted nodes deleted.');

  console.log('Deleting deleted content type nodes...');
  syncData.content_type_deleted &&
    syncData.content_type_deleted.forEach(item => {
      item.content_type_uid = item.content_type_uid.replace(/-/g, '_');
      const sameContentTypeNodes = getNodes().filter(
        n => n.internal.type === `${typePrefix}_${item.content_type_uid}`
      );
      sameContentTypeNodes.forEach(node => deleteNode(node));
    });
  console.log('Content type deleted nodes deleted.');

  console.log('Source nodes process completed.');
};