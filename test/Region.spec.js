'use strict';

/**
 * @file Region.spec..js
 * Tests Region class
 */
const Region = require('../src/Region.js');

/** @test {Region} */
describe('Region', function() {
  test('should be instantiated', function() {
    expect(Region).toBeTruthy();
  });
});

/** @test {Region.bind} */
describe('Region.bind(element)', function() {
  let region = new Region(document.body);
  test('should exist', function() {
    expect(region.bind).toBeDefined();
  });
});

