const { mdLinks, getStats, getStatsValidate } = require('../index.js');

describe('mdLinks', () => {
  it('should be a function', () => {
    expect(typeof mdLinks).toBe('function');
  });

  it('should throw an error if path does not exist', () => {
    expect(() => {
      const userPath = './testing';
      mdLinks(userPath, { validate: false });
    }).toThrow('Path not found');
  });

  it('should return [] if it is not an md file', () => {
    const userPath = 'test/md-links.spec.js';
    return mdLinks(userPath, { validate: false }).then((links) => {
      expect(links).toEqual([]);
    });
  });

  it('should return [] if the file does not have links', () => {
    const userPath = '../test2.md';
    return mdLinks(userPath, { validate: false }).then((links) => {
      expect(links).toEqual([]);
    });
  });
});

describe('getStats', () => {
  it('should be a function', () => {
    expect(typeof getStats).toBe('function');
  });
});

describe('getStatsValidate', () => {
  it('should be a function', () => {
    expect(typeof getStatsValidate).toBe('function');
  });
});