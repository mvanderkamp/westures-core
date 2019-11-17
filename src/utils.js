/*
 * Contains various helpful utilities.
 */

'use strict';

const PI_2 = 2 * Math.PI;
const PI_NVE = -Math.PI;

/**
 * Helper function to regulate angular differences, so they don't jump from 0 to
 * 2 * PI or vice versa.
 *
 * @memberof westures-core
 *
 * @param {number} a - Angle in radians.
 * @param {number} b - Angle in radians.
 * @return {number} c, given by: c = a - b such that || < PI
 */
function angularDifference(a, b = 0) {
  let diff = a - b;
  if (diff < PI_NVE) {
    diff += PI_2;
  } else if (diff > Math.PI) {
    diff -= PI_2;
  }
  return diff;
}

/**
 * In case event.composedPath() is not available.
 *
 * @memberof westures-core
 *
 * @param {Event} event
 *
 * @return {Element[]} The elements along the composed path of the event.
 */
function getPropagationPath(event) {
  if (typeof event.composedPath === 'function') {
    return event.composedPath();
  }

  const path = [];
  for (let node = event.target; node !== document; node = node.parentNode) {
    path.push(node);
  }
  path.push(document);
  path.push(window);

  return path;
}

/**
 * Performs a set filter operation.
 *
 * @memberof westures-core
 *
 * @param {Set} set - The set to filter.
 * @param {Function} predicate - Function to test elements of 'set'. Receives
 * one argument: the current set element.
 *
 * @return {Set} Set consisting of elements in 'set' for which 'predicate' is
 * true.
 */
function setFilter(set, predicate) {
  const result = new Set();
  set.forEach(element => {
    if (predicate(element)) {
      result.add(element);
    }
  });
  return result;
}

/**
 * Performs a set difference operation.
 *
 * @memberof westures-core
 *
 * @param {Set} left - Base set.
 * @param {Set} right - Set of elements to remove from 'left'.
 *
 * @return {Set} Set consisting of elements in 'left' that are not in
 * 'right'.
 */
function setDifference(left, right) {
  return setFilter(left, element => !right.has(element));
}

module.exports = Object.freeze({
  angularDifference,
  getPropagationPath,
  setDifference,
  setFilter,
});

