'use strict';

const Contentstack = require('@contentstack/utils');

const { getJSONToHtmlRequired } = require('./utils');
const { makeEntryNodeUid, makeAssetNodeUid } = require('./normalize');

exports.createResolvers = async ({ createResolvers, cache, createNodeId }, configOptions) => {
  const resolvers = {};

  const typePrefix = configOptions.type_prefix || 'Contentstack';
  const [fileFields, references, groups, jsonRteFields] = await Promise.all([
    cache.get(`${typePrefix}_${configOptions.api_key}_file_fields`),
    cache.get(`${typePrefix}_${configOptions.api_key}_references`),
    cache.get(`${typePrefix}_${configOptions.api_key}_groups`),
    cache.get(`${typePrefix}_${configOptions.api_key}_json_rte_fields`),
  ]);

  // for each of these content types create a root field cslp_meta
  // which resolves with LP metadata
  // typePrefix_contenttypeUId
  const contentTypes = await cache.get(typePrefix);
  const contentTypeMap = {};
  contentTypes.forEach((item) => {
    contentTypeMap[item.uid] = item;
  })

  // function collectReferences(currentPath = "", selectionSet, schema) {
  //   let referencePaths = [];
  //   if (schema.data_type === "reference") {
  //     referencePaths.push(currentPath.concat(".", schema.uid))
  //   }
  //   if (selectionSet?.selections.length) {
  //     return collectReferences(schema.uid, selectionSet)
  //   }
  // }

  function getCslpMetaPaths(selectionSet, path = "", schema, fragments) {
    let referencePaths = [];
    if (schema.data_type === "reference" && path) {
      referencePaths.push(path)
    }
    for (const selection of selectionSet.selections) {
      // exit when selection.kind is not Field, SelectionSet or InlineFragment
      // selection.name is not present for selection.kind is "InlineFragment"
      if (selection?.name?.value === "cslp__meta") {
        continue;
      }
      if (selection.selectionSet || selection.kind === "FragmentSpread") {
        let nestedFields = schema?.blocks ?? schema.schema;
        // selection.kind === "InlineFragment" && selection.typeCondition.name.value
        if (selection.kind === "FragmentSpread") {
          const fragmentName = selection.name.value;
          if (fragmentName in fragments) {
            const fragmentDefinition = fragments[fragmentName];
            const refPaths = getCslpMetaPaths(fragmentDefinition.selectionSet, path, schema, fragments);
            referencePaths.push(...refPaths);
          }
        }
        const inlineFragmentNodeType = selection.typeCondition?.name?.value;
        if (selection.kind === "InlineFragment" && inlineFragmentNodeType) {
          const contentTypeUid = inlineFragmentNodeType.replace(`${typePrefix}_`, "");
          if (contentTypeUid) {
            const contentTypeSchema = contentTypeMap[contentTypeUid];
            const refPaths = getCslpMetaPaths(selection.selectionSet, path, contentTypeSchema, fragments);
            referencePaths.push(...refPaths);
          }
        } else {
          // block
          if (schema.reference_to) {
            nestedFields = contentTypeMap[schema.reference_to[0]].schema
          }
          const nestedFieldSchema = nestedFields.find((item) => item.uid === selection.name.value);
          if (nestedFieldSchema) {
            let nextPath = []
            if (path) {
              nextPath = path.split(".")
            }
            nextPath.push(selection.name.value)
            const nestedReferencePaths = getCslpMetaPaths(selection.selectionSet, nextPath.join("."), nestedFieldSchema, fragments);
            referencePaths.push(...nestedReferencePaths);
          }
        }
      }
    }
    return referencePaths;
  }

  function getQueryContentTypeSelection(selectionSet, value, location, depth = 0) {
    // don't need to search for more than one level deep
    // as cslp__meta can only be one level deeper
    // e.g.
    // query {
    //   page {
    //     cslp__meta
    //   }
    //   blog {
    //     cslp__meta
    //   }
    // }
    if (depth > 1 || !selectionSet || !selectionSet.selections) {
      return;
    }
    for (const selection of selectionSet.selections) {
      if (
        selection.name?.value === value &&
        selection.loc?.start === location.start &&
        selection.loc?.end === location.end
      ) {
        return selectionSet
      }
      // search one level deeper for the correct node in this selection
      const nestedSelectionSet = getQueryContentTypeSelection(selection.selectionSet, value, location, depth + 1)
      // return when not undefined, meaning the correct selection has been found
      if (nestedSelectionSet) {
        return nestedSelectionSet;
      }

    }
  }

  contentTypes.forEach((contentType) => {
    // const name = `${typePrefix}_${contentTypeUid}`;
    resolvers[`${typePrefix}_${contentType.uid}`] = {
      "cslp__meta": {
        type: "JSON",
        resolve(source, args, context, info) {
          // console.log(source)
          // const source = JSON.parse(JSON.stringify(sourceCopy));
          const entryUid = source.uid;
          const contentTypeNodeType = source.internal.type
          const queryContentTypeUid = contentTypeNodeType.replace(`${typePrefix}_`, "")

          const fieldNode = info.fieldNodes.find((node) => node.name?.value === "cslp__meta");
          const fieldNodeValue = fieldNode.name?.value;
          const fieldNodeLocation = { start: fieldNode.name?.loc?.start, end: fieldNode.name?.loc?.end }
          const queryContentTypeSelection = getQueryContentTypeSelection(info.operation.selectionSet, fieldNodeValue, fieldNodeLocation)

          const contentType = contentTypeMap[queryContentTypeUid];
          const firstOperation = info.operation.selectionSet.selections[0];
          const paths = {}
          // for (const selection of firstOperation.selectionSet.selections) {
          //   if (selection.name.value === "cslp__meta") {
          //     continue;
          //   }
          //   const queryField = selection.name.value;
          //   // const fieldSchema = contentType.schema.find((field) => field.uid === queryField)
          //   // if (
          //   //   !fieldSchema ||
          //   //   fieldSchema.data_type !== "blocks" ||
          //   //   fieldSchema.data_type !== "group" ||
          //   //   fieldSchema.data_type !== "reference" ||
          //   //   fieldSchema.data_type !== "global_field"
          //   // ) {
          //   //   continue;
          //   // }
          //   paths[entryUid] = someName(selection.selectionSet, queryField, contentType)
          // }
          paths[entryUid] = {
            "referencePaths": getCslpMetaPaths(queryContentTypeSelection, "", contentType, info?.fragments ?? {})
          }
          // const operation = info.operation;
          console.log(info.operation)
          return paths;
        }
      }
    }
  })

  resolvers["Query"] = {
    "cslp__meta": {
      type: "JSON",
      resolve(source, args, context, info) {
        // const operation = info.operation;
        console.log(info.operation)
        return JSON.stringify(info.operation)
      }
    }
  },

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
        resolve(source, args, context, info) {
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