/*
 * Test suite for the Region class.
 */

'use strict';

const Region = require('../src/Region.js');

describe('Region', () => {
  test('should be instantiated', () => {
    expect(Region).toBeTruthy();
  });
});

describe('Region.bind(element)', () => {
  let region = new Region(document.body);
  test('should exist', () => {
    expect(region.bind).toBeDefined();
  });
});

