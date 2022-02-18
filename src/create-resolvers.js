'use strict';

exports.createResolvers = async ({ createResolvers, cache }, configOptions) => {
  const resolvers = {};

  const typePrefix = configOptions.type_prefix || 'Contentstack';
  const [fileFields, references, groups] = await Promise.all([
    cache.get(`${typePrefix}_${configOptions.api_key}_file_fields`),
    cache.get(`${typePrefix}_${configOptions.api_key}_references`),
    cache.get(`${typePrefix}_${configOptions.api_key}_groups`),
  ]);

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
  createResolvers(resolvers);
};