/**
 * Test suite for the Region class.
 */

'use strict';

const Region = require('../src/Region.js');

describe('Region', function() {
  test('should be instantiated', function() {
    expect(Region).toBeTruthy();
  });
});

describe('Region.bind(element)', function() {
  let region = new Region(document.body);
  test('should exist', function() {
    expect(region.bind).toBeDefined();
  });
});

