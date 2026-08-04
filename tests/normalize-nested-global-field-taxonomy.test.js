"use strict";

var _require = require('../normalize'),
  buildCustomSchema = _require.buildCustomSchema;
describe('buildCustomSchema: nested global field inside a block', function () {
  test('interface field points at the nested global field\'s own type, not a blind parent-name substitution', function () {
    var schema = [{
      uid: 'sections',
      data_type: 'blocks',
      mandatory: false,
      multiple: true,
      blocks: [{
        uid: 'hero',
        reference_to: 'hero_global',
        schema: [{
          uid: 'author_info',
          data_type: 'global_field',
          reference_to: 'author_global',
          mandatory: false,
          multiple: false,
          schema: [{
            uid: 'name',
            data_type: 'text',
            mandatory: false,
            multiple: false
          }]
        }]
      }]
    }];
    var result = buildCustomSchema(schema, [], [], [], [], [], 'Contentstack_blog', 'Contentstack', false, false, function () {}, undefined);
    var heroInterface = result.types.find(function (t) {
      return t.startsWith('interface Contentstack_hero_global');
    });
    expect(heroInterface).toBeDefined();
    expect(heroInterface).toContain('author_info:Contentstack_author_global');
    expect(heroInterface).not.toContain('Contentstack_hero_global_author_info');
  });
});
describe('buildCustomSchema: taxonomy field', function () {
  test('produces a taxonomyType field instead of being silently dropped', function () {
    var schema = [{
      uid: 'topics',
      data_type: 'taxonomy',
      mandatory: false,
      multiple: true
    }];
    var result = buildCustomSchema(schema, [], [], [], [], [], 'Contentstack_blog', 'Contentstack', false, false, function () {}, undefined);
    expect(result.fields.topics.type).toBe('[taxonomyType]');
    expect(result.types).toContain('type taxonomyType { taxonomy_uid: String term_uid: String }');
  });
  test('is wrapped in a non-null list when mandatory', function () {
    var schema = [{
      uid: 'topics',
      data_type: 'taxonomy',
      mandatory: true,
      multiple: true
    }];
    var result = buildCustomSchema(schema, [], [], [], [], [], 'Contentstack_blog', 'Contentstack', false, false, function () {}, undefined);
    expect(result.fields.topics.type).toBe('[taxonomyType]!');
  });
  test('multiple taxonomy fields on one content type do not push duplicate taxonomyType definitions', function () {
    var schema = [{
      uid: 'topics',
      data_type: 'taxonomy',
      mandatory: false,
      multiple: true
    }, {
      uid: 'regions',
      data_type: 'taxonomy',
      mandatory: false,
      multiple: true
    }];
    var result = buildCustomSchema(schema, [], [], [], [], [], 'Contentstack_blog', 'Contentstack', false, false, function () {}, undefined);
    var taxonomyTypeDefs = result.types.filter(function (t) {
      return t === 'type taxonomyType { taxonomy_uid: String term_uid: String }';
    });
    expect(taxonomyTypeDefs).toHaveLength(1);
    expect(result.fields.topics.type).toBe('[taxonomyType]');
    expect(result.fields.regions.type).toBe('[taxonomyType]');
  });
});
//# sourceMappingURL=normalize-nested-global-field-taxonomy.test.js.map