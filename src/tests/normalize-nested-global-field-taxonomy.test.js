const { buildCustomSchema } = require('../normalize');

describe('buildCustomSchema: nested global field inside a block', () => {
  test('interface field points at the nested global field\'s own type, not a blind parent-name substitution', () => {
    const schema = [
      {
        uid: 'sections',
        data_type: 'blocks',
        mandatory: false,
        multiple: true,
        blocks: [
          {
            uid: 'hero',
            reference_to: 'hero_global',
            schema: [
              {
                uid: 'author_info',
                data_type: 'global_field',
                reference_to: 'author_global',
                mandatory: false,
                multiple: false,
                schema: [
                  { uid: 'name', data_type: 'text', mandatory: false, multiple: false },
                ],
              },
            ],
          },
        ],
      },
    ];

    const result = buildCustomSchema(schema, [], [], [], [], [], 'Contentstack_blog', 'Contentstack', false, false, () => {}, undefined);

    const heroInterface = result.types.find((t) => t.startsWith('interface Contentstack_hero_global'));
    expect(heroInterface).toBeDefined();
    expect(heroInterface).toContain('author_info:Contentstack_author_global');
    expect(heroInterface).not.toContain('Contentstack_hero_global_author_info');
  });
});

describe('buildCustomSchema: taxonomy field', () => {
  test('produces a taxonomyType field instead of being silently dropped', () => {
    const schema = [
      { uid: 'topics', data_type: 'taxonomy', mandatory: false, multiple: true },
    ];

    const result = buildCustomSchema(schema, [], [], [], [], [], 'Contentstack_blog', 'Contentstack', false, false, () => {}, undefined);

    expect(result.fields.topics.type).toBe('[taxonomyType]');
    expect(result.types).toContain('type taxonomyType { taxonomy_uid: String term_uid: String }');
  });

  test('is wrapped in a non-null list when mandatory', () => {
    const schema = [
      { uid: 'topics', data_type: 'taxonomy', mandatory: true, multiple: true },
    ];

    const result = buildCustomSchema(schema, [], [], [], [], [], 'Contentstack_blog', 'Contentstack', false, false, () => {}, undefined);

    expect(result.fields.topics.type).toBe('[taxonomyType]!');
  });
});
