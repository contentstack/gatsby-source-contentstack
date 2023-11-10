const { getCustomHeaders } = require('../utils');

describe('getCustomHeaders', () => {
  test('Check if the Header Key and Value in config are invalid', () => {
    expect(getCustomHeaders('', '')).toEqual({});
    expect(getCustomHeaders(undefined, undefined)).toEqual({});
    expect(getCustomHeaders('x-header-ea', '')).toEqual({});
    expect(getCustomHeaders('', 'newcda')).toEqual({});
    expect(getCustomHeaders(' ', ' ')).toEqual({});
    expect(getCustomHeaders('  ', '  ')).toEqual({});
    expect(getCustomHeaders(null, ' ')).toEqual({});
    expect(getCustomHeaders('header-ea', 'cda')).toEqual({});
  });

  test('Check if the Header Key and Value in config are valid', () => {
    expect(getCustomHeaders('x-header-ea', 'newcda')).toEqual({
      'x-header-ea': 'newcda',
    });
    expect(getCustomHeaders(' x-header-ea ', ' newcda ')).toEqual({
      'x-header-ea': 'newcda',
    });
    expect(getCustomHeaders('x-header-ea', 'newcda,taxonomy')).toEqual({
      'x-header-ea': 'newcda,taxonomy',
    });
    expect(getCustomHeaders('x-header-ea', ' newcda , taxonomy ')).toEqual({
      'x-header-ea': 'newcda,taxonomy',
    });
  });
});
