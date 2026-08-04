const { FetchSpecifiedContentTypesEntries } = require('../entry-data');
const { FetchUnspecifiedContentTypes } = require('../contenttype-data');

function createMockCache(store) {
  return {
    get: async (key) => store[key],
    set: async (key, value) => { store[key] = value; },
  };
}

describe('excludeContentTypes cache isolation across instances sharing a type_prefix', () => {
  test('reads its own instance content-types list, not another stack\'s', async () => {
    const store = {
      'Contentstack_stackA': [{ uid: 'blog' }],
      'Contentstack_stackB': [{ uid: 'blog' }, { uid: 'home' }],
    };
    const cache = createMockCache(store);
    const fn = jest.fn().mockResolvedValue({ data: [] });

    const configA = { type_prefix: 'Contentstack', api_key: 'stackA', excludeContentTypes: ['home'] };
    await new FetchSpecifiedContentTypesEntries().fetchEntries(configA, cache, fn);

    const syncedContentTypeUids = fn.mock.calls.map(([params]) => params.content_type_uid);
    expect(syncedContentTypeUids).toEqual(['blog']);
  });
});

describe('FetchUnspecifiedContentTypes referred content types', () => {
  test('excludes referred content types that are in excludeContentTypes', async () => {
    const config = { excludeContentTypes: ['author'] };
    const primaryContentTypes = [
      { uid: 'blog', schema: [{ data_type: 'reference', reference_to: ['author', 'category'] }] },
    ];
    const fn = jest.fn()
      .mockResolvedValueOnce(primaryContentTypes)
      .mockResolvedValueOnce([{ uid: 'category', schema: [] }]);

    await new FetchUnspecifiedContentTypes().getPagedData('content_types', config, 'content_types', fn);

    const secondCallQuery = JSON.parse(fn.mock.calls[1][3].query);
    expect(secondCallQuery.uid.$in).toEqual(['category']);
  });
});
