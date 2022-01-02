'use strict';

const { buildCustomSchema, extendSchemaWithDefaultEntryFields } = require('./normalize');
const { fetchContentTypes } = require('./fetch');

exports.createSchemaCustomization = async ({ cache, actions, schema }, configOptions) => {
  let contentTypes;

  const typePrefix = configOptions.type_prefix || 'Contentstack';
  const disableMandatoryFields = configOptions.disableMandatoryFields || false;
  try {
    const contentTypeOption = getContentTypeOption(configOptions);
    contentTypes = await fetchContentTypes(configOptions, contentTypeOption);
    // Caching content-types because we need to be able to support multiple stacks.
    await cache.set(typePrefix, contentTypes);
  } catch (error) {
    console.error('Contentstack fetch content type failed!');
  }

  let references = [], groups = [], fileFields = [];

  if (configOptions.enableSchemaGeneration) {
    const { createTypes } = actions;
    contentTypes.forEach(contentType => {
      const contentTypeUid = contentType.uid.replace(/-/g, '_');
      const name = `${typePrefix}_${contentTypeUid}`;
      const extendedSchema = extendSchemaWithDefaultEntryFields(contentType.schema);
      let result = buildCustomSchema(extendedSchema, [], [], [], [], name, typePrefix, disableMandatoryFields);
      references = references.concat(result.references);
      groups = groups.concat(result.groups);
      fileFields = fileFields.concat(result.fileFields);
      const typeDefs = [
        `type linktype {
              title: String
              href: String
        }`,
        schema.buildObjectType({
          name,
          fields: result.fields,
          interfaces: ['Node'],
          extensions: { infer: true }
        }),
      ];
      result.types = result.types.concat(typeDefs);
      createTypes(result.types);
    });

    await Promise.all([
      await cache.set(`${typePrefix}_${configOptions.api_key}_references`, references),
      await cache.set(`${typePrefix}_${configOptions.api_key}_groups`, groups),
      await cache.set(`${typePrefix}_${configOptions.api_key}_file_fields`, fileFields),
    ]);

    /**CREATE TYPE DEFINITION FOR CONTENTTYPE OBJECT */
    const name = `${typePrefix}ContentTypes`;
    const fields = {
      title: 'String!',
      uid: 'String!',
      created_at: 'Date',
      updated_at: 'Date',
      schema: 'JSON!',
      description: 'String',
    };
    createTypes([
      schema.buildObjectType({
        name,
        fields,
        interfaces: ['Node'],
        extensions: { infer: false },
      }),
    ]);
  }
};