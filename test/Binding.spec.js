'use strict';

/**
 * @file Binding.js
 * Tests Binding class
 */
const Binding = require('../src/Binding.js');
const Gesture = require('../src/Gesture.js');

describe('Module exists', () => {
  expect(Binding).toBeDefined();
});

let gesture = new Gesture('dummy');
let element = document.createElement('div');

/** @test {Binding} */
describe('constructor', function() {
  let binding;

  test('Can be instantiated', () => {
    expect(() => {
      binding = new Binding(element, gesture, jest.fn(), false, false);
    }).not.toThrow();
  });
});

