"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends4 = require("babel-runtime/helpers/extends");

var _extends5 = _interopRequireDefault(_extends4);

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require("./normalize"),
    normalizeEntry = _require.normalizeEntry,
    processContentType = _require.processContentType,
    processEntry = _require.processEntry,
    processAsset = _require.processAsset,
    makeEntryNodeUid = _require.makeEntryNodeUid,
    makeAssetNodeUid = _require.makeAssetNodeUid,
    buildCustomSchema = _require.buildCustomSchema,
    extendSchemaWithDefaultEntryFields = _require.extendSchemaWithDefaultEntryFields,
    getChildNodes = _require.getChildNodes,
    processContentTypeInnerObject = _require.processContentTypeInnerObject;

var _require2 = require("./fetch"),
    fetchData = _require2.fetchData,
    fetchContentTypes = _require2.fetchContentTypes;

var references = [];
var groups = [];
exports.createSchemaCustomization = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, configOptions) {
    var cache = _ref2.cache,
        actions = _ref2.actions,
        schema = _ref2.schema,
        createNodeId = _ref2.createNodeId,
        createContentDigest = _ref2.createContentDigest;
    var contentTypes, typePrefix, createTypes, createNode, contentTypeInterface;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            contentTypes = void 0;
            typePrefix = configOptions.type_prefix || "Contentstack";
            _context.prev = 2;
            _context.next = 5;
            return fetchContentTypes(configOptions);

          case 5:
            contentTypes = _context.sent;
            _context.next = 8;
            return cache.set(typePrefix, contentTypes);

          case 8:
            _context.next = 13;
            break;

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](2);

            console.error("Contentstack fetch content type failed!");

          case 13:
            if (configOptions.enableSchemaGeneration) {
              createTypes = actions.createTypes, createNode = actions.createNode;

              contentTypes.forEach(function (contentType) {
                var contentTypeUid = contentType.uid.replace(/-/g, "_");
                var name = typePrefix + "_" + contentTypeUid;
                var extendedSchema = extendSchemaWithDefaultEntryFields(contentType.schema);
                var result = buildCustomSchema(extendedSchema, [], [], [], name, typePrefix);
                references = references.concat(result.references);
                groups = groups.concat(result.groups);
                var typeDefs = ["type linktype{\n              title: String\n              href: String\n            }", schema.buildObjectType({
                  name: name,
                  fields: result.fields,
                  interfaces: ["Node"]
                })];
                result.types = result.types.concat(typeDefs);
                createTypes(result.types);
              });

              contentTypeInterface = typePrefix + "ContentTypes";

              createTypes("\n      interface " + contentTypeInterface + " @nodeInterface {\n        id: ID!\n        title: String\n        uid: String\n      }\n    ");

              // Create custom schema for content types
              contentTypes.forEach(function (contentType) {
                var contentTypeUid = contentType.uid.replace(/-/g, "_");
                var name = typePrefix + "ContentTypes" + contentTypeUid;

                var result = getTypeDefs(contentType, schema, [], name, createNode, createNodeId, createContentDigest, typePrefix);
                createTypes(result);

                var unionTypes = getUnionTypes(contentType.schema, name);
                var unionName = getUnionName(contentType.schema, name);

                var typeDefs = [];

                typeDefs.push(schema.buildUnionType({
                  name: unionName,
                  types: unionTypes,
                  resolveType: function resolveType(value) {
                    return value.internal.type;
                  }
                }));

                var fields = {
                  title: "String!",
                  uid: "String!",
                  schema: {
                    type: "[" + unionName + "]",
                    resolve: function resolve(source, args, context) {
                      var nodesData = [];
                      source.schema___NODE.forEach(function (id) {
                        context.nodeModel.getAllNodes().find(function (node) {
                          if (node.id === id) nodesData.push(node);
                        });
                      });
                    }
                  }
                };

                typeDefs.push(schema.buildObjectType({
                  name: name,
                  fields: fields,
                  interfaces: ["Node", contentTypeInterface]
                }));
                createTypes(typeDefs);
              });
            }

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[2, 10]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

function getTypeDefs(contentType, gatsbySchema, typeDefs, name, createNode, createNodeId, createContentDigest, typePrefix) {
  typeDefs = typeDefs || [];

  contentType.schema.forEach(function (schema) {
    switch (schema.data_type) {
      case "group":
      case "global_field":
        {
          var newParent = name + "_" + schema.uid;
          getTypeDefs(schema, gatsbySchema, typeDefs, newParent, createNode, createNodeId, createContentDigest, typePrefix);

          var fields = getObjectFieldsByTypes(schema);
          fields.schema = {
            type: "[" + unionName + "]",
            resolve: function resolve(source, args, context) {
              var nodesData = [];
              source.schema___NODE.forEach(function (id) {
                context.nodeModel.getAllNodes().find(function (node) {
                  if (node.id === id) nodesData.push(node);
                });
              });
              return nodesData;
            }
          };
          // Union types are created appending parent name and field uid
          // separated by "_".
          var unionTypes = getUnionTypes(schema.schema, newParent);
          var unionName = getUnionName(schema.schema, newParent);
          // After recursive call is over, create union
          // NOTE: object types are created in default block
          typeDefs.push(gatsbySchema.buildUnionType({
            name: unionName,
            types: unionTypes,
            resolveType: function resolveType(value) {
              return value.internal.type;
            }
          }));

          typeDefs.push(gatsbySchema.buildObjectType({
            name: newParent,
            fields: fields,
            interfaces: ["Node"]
          }));

          var contentTypeInnerObject = getContentTypeInnerObject(schema);
          contentTypeInnerObject.schema___NODE = getChildNodes(schema.schema, newParent, typePrefix, createNodeId);
          // Create node
          var nodeData = processContentTypeInnerObject(contentTypeInnerObject, createNodeId, createContentDigest, typePrefix, newParent);
          createNode(nodeData);
          break;
        }
      case "blocks":
        break;
      default:
        {
          // This will never have schema array in content type
          var type = name + "_" + schema.uid;
          var _fields = getObjectFieldsByTypes(schema);

          typeDefs.push(gatsbySchema.buildObjectType({
            name: type,
            fields: _fields,
            interfaces: ["Node"]
          }));
          var _contentTypeInnerObject = getContentTypeInnerObject(schema);
          // Create node
          var _nodeData = processContentTypeInnerObject(_contentTypeInnerObject, createNodeId, createContentDigest, typePrefix, type);
          createNode(_nodeData);
          break;
        }
    }
  });

  return typeDefs;
}

function getContentTypeInnerObject(obj) {
  var newObj = {};
  for (var key in obj) {
    switch ((0, _typeof3.default)(obj[key])) {
      case "boolean":
        newObj[key] = obj[key];
        break;
      case "number":
        newObj[key] = obj[key];
        break;
      case "string":
        newObj[key] = obj[key];
        break;
      // case 'object':
      //   newObj[key] = 'Int';
      //   break;
      default:
        break;
    }
  }
  return newObj;
}

function getObjectFieldsByTypes(obj) {
  var newObj = {};
  for (var key in obj) {
    switch ((0, _typeof3.default)(obj[key])) {
      case "boolean":
        newObj[key] = "Boolean";
        break;
      case "number":
        newObj[key] = "Int";
        break;
      case "string":
        newObj[key] = "String";
        break;
      // case 'object':
      //   newObj[key] = 'Int';
      //   break;
      default:
        break;
    }
  }
  return newObj;
}

function getUnionTypes(schema, parent) {
  var unionTypes = [];
  schema.forEach(function (field) {
    var type = parent + "_" + field.uid;
    unionTypes.push(type);
  });
  return unionTypes;
}

function getUnionName(schema, parent) {
  var string = parent;
  schema.forEach(function (field) {
    string += field.uid;
  });
  string = string + "Union";
  return string;
}

exports.sourceNodes = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref4, configOptions) {
    var cache = _ref4.cache,
        actions = _ref4.actions,
        getNode = _ref4.getNode,
        getNodes = _ref4.getNodes,
        createNodeId = _ref4.createNodeId,
        store = _ref4.store,
        reporter = _ref4.reporter,
        createContentDigest = _ref4.createContentDigest;

    var createNode, deleteNode, touchNode, setPluginStatus, syncToken, _store$getState, status, typePrefix, _ref5, contentstackData, syncData, entriesNodeIds, assetsNodeIds, existingNodes, deleteContentstackNodes, nextSyncToken, newState;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            deleteContentstackNodes = function deleteContentstackNodes(item, type) {
              var nodeId = "";
              var node = null;
              if (type === "entry") {
                nodeId = createNodeId(typePrefix.toLowerCase() + "-entry-" + item.uid + "-" + item.locale);
              }
              if (type === "asset") {
                nodeId = createNodeId(typePrefix.toLowerCase() + "-assets-" + item.uid + "-" + item.locale);
              }
              node = getNode(nodeId);
              if (node) {
                deleteNode({
                  node: node
                });
              }
            };

            createNode = actions.createNode, deleteNode = actions.deleteNode, touchNode = actions.touchNode, setPluginStatus = actions.setPluginStatus;
            syncToken = void 0;
            _store$getState = store.getState(), status = _store$getState.status;
            // use a custom type prefix if specified

            typePrefix = configOptions.type_prefix || "Contentstack";


            if (status && status.plugins && status.plugins["gatsby-source-contentstack"]) {
              syncToken = status.plugins["gatsby-source-contentstack"][typePrefix.toLowerCase() + "-sync-token-" + configOptions.api_key];
            }

            configOptions.syncToken = syncToken || null;

            _context2.next = 9;
            return fetchData(configOptions, reporter);

          case 9:
            _ref5 = _context2.sent;
            contentstackData = _ref5.contentstackData;
            _context2.next = 13;
            return cache.get(typePrefix);

          case 13:
            contentstackData.contentTypes = _context2.sent;
            syncData = contentstackData.syncData.reduce(function (merged, item) {
              if (!merged[item.type]) {
                merged[item.type] = [];
              }
              merged[item.type].push(item);
              return merged;
            }, {});

            // for checking if the reference node is present or not

            entriesNodeIds = new _set2.default();
            assetsNodeIds = new _set2.default();
            existingNodes = getNodes().filter(function (n) {
              return n.internal.owner === "gatsby-source-contentstack";
            });


            existingNodes.forEach(function (n) {
              if (n.internal.type !== typePrefix + "ContentTypes" && n.internal.type !== typePrefix + "_assets") {
                entriesNodeIds.add(n.id);
              }
              if (n.internal.type === typePrefix + "_assets") {
                assetsNodeIds.add(n.id);
              }
              touchNode({
                nodeId: n.id
              });
            });

            syncData.entry_published && syncData.entry_published.forEach(function (item) {
              var entryNodeId = makeEntryNodeUid(item.data, createNodeId, typePrefix);
              entriesNodeIds.add(entryNodeId);
            });

            syncData.asset_published && syncData.asset_published.forEach(function (item) {
              var entryNodeId = makeAssetNodeUid(item.data, createNodeId, typePrefix);
              assetsNodeIds.add(entryNodeId);
            });

            // adding nodes
            contentstackData.contentTypes.forEach(function (contentType) {
              contentType.uid = contentType.uid.replace(/-/g, "_");
              var contentTypeNode = processContentType(contentType, createNodeId, createContentDigest, typePrefix);
              createNode(contentTypeNode);
            });

            syncData.entry_published && syncData.entry_published.forEach(function (item) {
              item.content_type_uid = item.content_type_uid.replace(/-/g, "_");
              var contentType = contentstackData.contentTypes.find(function (contentType) {
                return item.content_type_uid === contentType.uid;
              });
              var normalizedEntry = normalizeEntry(contentType, item.data, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
              var entryNode = processEntry(contentType, normalizedEntry, createNodeId, createContentDigest, typePrefix);
              createNode(entryNode);
            });

            syncData.asset_published && syncData.asset_published.forEach(function (item) {
              var assetNode = processAsset(item.data, createNodeId, createContentDigest, typePrefix);
              createNode(assetNode);
            });

            // deleting nodes

            syncData.entry_unpublished && syncData.entry_unpublished.forEach(function (item) {
              deleteContentstackNodes(item.data, "entry");
            });

            syncData.asset_unpublished && syncData.asset_unpublished.forEach(function (item) {
              deleteContentstackNodes(item.data, "asset");
            });

            syncData.entry_deleted && syncData.entry_deleted.forEach(function (item) {
              deleteContentstackNodes(item.data, "entry");
            });

            syncData.asset_deleted && syncData.asset_deleted.forEach(function (item) {
              deleteContentstackNodes(item.data, "asset");
            });

            syncData.content_type_deleted && syncData.content_type_deleted.forEach(function (item) {
              item.content_type_uid = item.content_type_uid.replace(/-/g, "_");
              var sameContentTypeNodes = getNodes().filter(function (n) {
                return n.internal.type === typePrefix + "_" + item.content_type_uid;
              });
              sameContentTypeNodes.forEach(function (node) {
                return deleteNode({
                  node: node
                });
              });
            });

            // Updating the syncToken
            nextSyncToken = contentstackData.sync_token;

            // Storing the sync state for the next sync

            newState = {};

            newState[typePrefix.toLowerCase() + "-sync-token-" + configOptions.api_key] = nextSyncToken;
            setPluginStatus(newState);

          case 33:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();

exports.createResolvers = function (_ref6) {
  var createResolvers = _ref6.createResolvers;

  var resolvers = {};
  references.forEach(function (reference) {
    resolvers[reference.parent] = (0, _extends5.default)({}, resolvers[reference.parent], (0, _defineProperty3.default)({}, reference.uid, {
      resolve: function resolve(source, args, context, info) {
        if (source[reference.uid + "___NODE"]) {
          var nodesData = [];
          source[reference.uid + "___NODE"].forEach(function (id) {
            context.nodeModel.getAllNodes().find(function (node) {
              if (node.id === id) {
                nodesData.push(node);
              }
            });
          });
          return nodesData;
        }
        return [];
      }
    }));
  });
  groups.forEach(function (group) {
    resolvers[group.parent] = (0, _extends5.default)({}, resolvers[group.parent], (0, _defineProperty3.default)({}, group.field.uid, {
      resolve: function resolve(source) {
        if (group.field.multiple && !Array.isArray(source[group.field.uid])) {
          return [];
        }
        return source[group.field.uid] || null;
      }
    }));
  });
  createResolvers(resolvers);
};