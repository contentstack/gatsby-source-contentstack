'use strict';

const Contentstack = require('@contentstack/utils');

const { getJSONToHtmlRequired } = require('./utils');
const { makeEntryNodeUid, makeAssetNodeUid } = require('./normalize');
const { resolveCslpMeta } = require('./live-preview/resolveCslpMeta');

exports.createResolvers = async ({ createResolvers, cache, createNodeId }, configOptions) => {
  const resolvers = {};

  const typePrefix = configOptions.type_prefix || 'Contentstack';
  const [fileFields, references, groups, jsonRteFields] = await Promise.all([
    cache.get(`${typePrefix}_${configOptions.api_key}_file_fields`),
    cache.get(`${typePrefix}_${configOptions.api_key}_references`),
    cache.get(`${typePrefix}_${configOptions.api_key}_groups`),
    cache.get(`${typePrefix}_${configOptions.api_key}_json_rte_fields`),
  ]);

  const contentTypes = await cache.get(typePrefix);
  const contentTypeMap = {};
  contentTypes.forEach((item) => {
    contentTypeMap[item.uid] = item;
  });

  contentTypes.forEach((contentType) => {
    resolvers[`${typePrefix}_${contentType.uid}`] = {
      "cslp__meta": {
        type: "JSON",
        resolve(source, args, context, info) {
          try {
            return resolveCslpMeta({ source, args, context, info, contentTypeMap, typePrefix })
          }
          catch (error) {
            console.error("ContentstackGatsby (Live Preview):", error)
            return {
              error: {
                message: error.message ?? "failed to resolve cslp__meta"
              }
            }
          }
        }
      }
    }
  })

  fileFields && fileFields.forEach(fileField => {
    resolvers[fileField.parent] = {
      ...resolvers[fileField.parent],
      ... {
        [fileField.field.uid]: {
          resolve(source, args, context) {
            if (fileField.field.multiple && source[`${fileField.field.uid}___NODE`]) {
              const nodesData = [];

              source[`${fileField.field.uid}___NODE`].forEach(id => {
                const existingNode = context.nodeModel.getNodeById({ id });

                if (existingNode) {
                  nodesData.push(existingNode);
                }
              });

              return nodesData;
            } else {
              const id = source[`${fileField.field.uid}___NODE`];
              return context.nodeModel.getNodeById({ id });
            }
          },
        },
      }
    };
  })
  references && references.forEach(reference => {
    resolvers[reference.parent] = {
      ...resolvers[reference.parent],
      [reference.uid]: {
        resolve(source, args, context) {
          if (source[`${reference.uid}___NODE`]) {
            const nodesData = [];

            source[`${reference.uid}___NODE`].forEach(id => {
              const existingNode = context.nodeModel.getNodeById({ id });

              if (existingNode) {
                nodesData.push(existingNode);
              }
            });

            return nodesData;
          }
          return [];
        },
      },
    };
  });
  groups && groups.forEach(group => {
    resolvers[group.parent] = {
      ...resolvers[group.parent],
      ...{
        [group.field.uid]: {
          resolve: source => {
            if (group.field.multiple && !Array.isArray(source[group.field.uid])) {
              return [];
            }
            return source[group.field.uid] || null;
          },
        },
      },
    };
  });
  jsonRteFields && jsonRteFields.forEach(jsonRteField => {
    resolvers[jsonRteField.parent] = {
      ...resolvers[jsonRteField.parent],
      ...{
        [jsonRteField.field.uid]: {
          resolve: (source, args, context) => {
            if (getJSONToHtmlRequired(configOptions.jsonRteToHtml, jsonRteField.field)) {
              const keys = Object.keys(source);
              const embeddedItems = {};
              for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (!source[key]) {
                  continue;
                }
                if (Array.isArray(source[key])) {
                  for (let j = 0; j < source[key].length; j++) {
                    if (source[key][j].type === 'doc') {
                      source[key] = parseJSONRTEToHtml(source[key][j].children, embeddedItems, key, source, context, createNodeId, typePrefix);
                    }
                  }
                } else {
                  if (source[key].type === 'doc') {
                    source[key] = parseJSONRTEToHtml(source[key].children, embeddedItems, key, source, context, createNodeId, typePrefix);
                  }
                }
              }
            }
            return source[jsonRteField.field.uid] || null;
          }
        }
      }
    };
  });
  createResolvers(resolvers);
};

function parseJSONRTEToHtml(children, embeddedItems, key, source, context, createNodeId, prefix) {
  embeddedItems[key] = embeddedItems[key] || [];
  getChildren(children, embeddedItems, key, source, context, createNodeId, prefix);
  source._embedded_items = { ...source._embedded_items, ...embeddedItems };
  return parseJSONRteToHtmlHelper(source, key);
}

function getChildren(children, embeddedItems, key, source, context, createNodeId, prefix) {
  for (let j = 0; j < children.length; j++) {
    const child = children[j];
    if (child.type === 'reference') {

      let id;
      if (child.attrs && child.attrs.type === 'asset') {
        id = makeAssetNodeUid({
          publish_details: { locale: source.publish_details.locale },
          uid: child.attrs['asset-uid'],
        }, createNodeId, prefix);
      } else {
        id = makeEntryNodeUid({
          publish_details: { locale: source.publish_details.locale },
          uid: child.attrs['entry-uid']
        }, createNodeId, prefix);
      }

      const node = context.nodeModel.getNodeById({ id });
      // The following line is required by contentstack utils package to parse value from json to html.
      node._content_type_uid = child.attrs['content-type-uid'];
      embeddedItems[key].push(node);
    }
    if (child.children) {
      getChildren(child.children, embeddedItems, key, source, context, createNodeId, prefix);
    }
  }
}

function parseJSONRteToHtmlHelper(value, path) {
  let jsonRteToHtml = {};
  if (value) {
    Contentstack.jsonToHTML({
      entry: value,
      paths: [path]
    });
    jsonRteToHtml = value[path];
  } else {
    jsonRteToHtml = null;
  }
  return jsonRteToHtml;
};