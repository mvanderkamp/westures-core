/* global jest, expect, describe, test, beforeAll, beforeEach */

'use strict';

const State = require('../src/State.js');
const Input = require('../src/Input.js');
const { PHASE } = require('../src/constants.js');

const MouseEvent = require('./MouseEvent.js');
const TouchEvent = require('./TouchEvent.js');
const PointerEvent = require('./PointerEvent.js');

const inputSymbol = Symbol.for('inputs');

const INPUT_CLASSES = { MouseEvent, TouchEvent, PointerEvent };
const CLASS_STRINGS = ['MouseEvent', 'TouchEvent', 'PointerEvent'];

function getEvents(input_class, target, phase) {
  if (input_class === MouseEvent) {
    return [
      new input_class(0, target, input_class[phase], 42, 43),
    ];
  }

  return [
    new input_class(0, target, input_class[phase], 42, 43),
    new input_class(1, target, input_class[phase], 42, 43),
    new input_class(2, target, input_class[phase], 42, 43),
    new input_class(3, target, input_class[phase], 42, 43),
    new input_class(4, target, input_class[phase], 42, 43),
    new input_class(5, target, input_class[phase], 42, 43),
    new input_class(6, target, input_class[phase], 42, 43),
  ];
}

function getTestEvents(input_class, target) {
  if (input_class === MouseEvent) {
    return [
      new input_class(0, target, input_class.end,  43, 40),
    ];
  }

  return [
    new input_class(1, target, input_class.end,  43, 40),
    new input_class(2, target, input_class.move, 46, 41),
    new input_class(3, target, input_class.move, 36, 51),
    new input_class(6, target, input_class.end,  32, 47),
  ];
}

let state       = null;
let startevents = null;
let moveevents  = null;
let endevents   = null;
let testevents  = null;
let outerdiv    = null;
let parentdiv   = null;
let targetdiv   = null;
let sendAll     = null;

describe('State', () => {
  beforeAll(() => {
    outerdiv = document.createElement('div');
    parentdiv = document.createElement('div');
    targetdiv = document.createElement('div');

    document.body.appendChild(outerdiv);
    document.body.appendChild(parentdiv);
    parentdiv.appendChild(targetdiv);
  });

  describe('constructor()', () => {
    test('Requires no arguments', () => {
      expect(() => new State()).not.toThrow();
    });

    test('Instantiates the correct type of object', () => {
      expect(new State()).toBeInstanceOf(State);
    });
  });

  describe('prototype methods', () => {
    describe.each(CLASS_STRINGS)('%s', (class_str) => {
      beforeAll(() => {
        startevents = getEvents(INPUT_CLASSES[class_str], targetdiv, 'start');
        moveevents = getEvents(INPUT_CLASSES[class_str], targetdiv, 'move');
        endevents = getEvents(INPUT_CLASSES[class_str], targetdiv, 'end');
        testevents = getTestEvents(INPUT_CLASSES[class_str], targetdiv);
      });

      beforeEach(() => {
        state = new State();

        sendAll = function sendAll(eventarray) {
          for (let i = 0; i < eventarray.length; ++i) {
            state.updateAllInputs(eventarray[i]);
          }
        };
      });

      describe('updateInput', () => {
        test('Instantiates a new input for "start" phase events', () => {
          expect(state[inputSymbol].get(0)).toBeFalsy();
          expect(state[inputSymbol].size).toBe(0);
          expect(() => state.updateInput(startevents[0], 0)).not.toThrow();
          expect(state[inputSymbol].get(0)).toBeInstanceOf(Input);
          expect(state[inputSymbol].get(0).phase).toBe('start');
        });

        test('Updates an old input for "move" or "end" phase events', () => {
          expect(() => state.updateInput(startevents[0], 0)).not.toThrow();
          expect(state[inputSymbol].get(0).phase).toBe('start');
          expect(() => state.updateInput(moveevents[0], 0)).not.toThrow();
          expect(state[inputSymbol].get(0).phase).toBe('move');
          expect(() => state.updateInput(endevents[0], 0)).not.toThrow();
          expect(state[inputSymbol].get(0).phase).toBe('end');
        });

        test('Logs a warning to the console for unrecognized phases', () => {
          const oldWarn = console.warn;
          console.warn = jest.fn();
          const event = { type: 'not a type' };

          state.updateInput(event, 0);
          expect(console.warn).toHaveBeenCalled();

          console.warn = oldWarn;
        });

        test('Skips non-start events for unstarted inputs', () => {
          expect(() => state.updateInput(moveevents[0], 0)).not.toThrow();
          expect(state[inputSymbol].get(0)).toBeFalsy();
          expect(state[inputSymbol].size).toBe(0);
          expect(() => state.updateInput(endevents[0], 0)).not.toThrow();
          expect(state[inputSymbol].get(0)).toBeFalsy();
          expect(state[inputSymbol].size).toBe(0);
        });
      });

      describe('updateAllInputs', () => {
        test('Instantiates new inputs for "start" phase events', () => {
          function doUpdateStarts(i) {
            state.updateAllInputs(startevents[i]);
          }

          for (let i = 0; i < startevents.length; i++) {
            expect(state[inputSymbol].get(i)).toBeFalsy();
            expect(() => doUpdateStarts(i)).not.toThrow();
            expect(state[inputSymbol].get(i)).toBeInstanceOf(Input);
          }
        });

        test('Updates old inputs for "move" or "end" phase events', () => {
          sendAll(startevents);
          sendAll(testevents);

          testevents.forEach(event => {
            expect(state[inputSymbol].get(event.id).phase)
              .toBe(PHASE[event.type]);
          });
        });

        test('Records additional information about state after update', () => {
          sendAll(startevents);
          sendAll(testevents);

          expect(state.inputs).toBeDefined();
          expect(state.active).toBeDefined();
          expect(state.activePoints).toBeDefined();
          expect(state.centroid).toBeDefined();
          expect(state.event).toBeDefined();
        });

        test('Ignores mouse events other than button 0', () => {
          const event = new MouseEvent(1, targetdiv, MouseEvent.start, 42, 43);
          expect(() => state.updateAllInputs(event)).not.toThrow();
          expect(state[inputSymbol].get(1)).toBeFalsy();
          expect(state[inputSymbol].size).toBe(0);
        });
      });

      describe('getEndedInputs()', () => {
        test('Retrieves the right number of inputs', () => {
          sendAll(startevents);
          expect(state.getEndedInputs().length).toBe(0);

          sendAll(testevents);
          expect(state.getEndedInputs().length).toBe(0);

          sendAll(moveevents);
          expect(state.getEndedInputs().length).toBe(0);

          sendAll(endevents);
          expect(state.getEndedInputs().length)
            .toBe(endevents.length);
        });

        test('All retrieved inputs are the correct phase', () => {
          sendAll(startevents);
          sendAll(testevents);
          state.getEndedInputs().forEach(s => {
            expect(s.phase).toBe('end');
          });
        });
      });

      describe('getActiveInputs(phase)', () => {
        test('All retrieved inputs are not in the given phase', () => {
          sendAll(startevents);
          sendAll(testevents);
          state.getActiveInputs().forEach(s => {
            expect(s.phase).not.toBe('end');
          });
        });
      });

      describe('clearEndedInputs', () => {
        test('Removes inputs in "end" phase from state', () => {
          sendAll(startevents);
          sendAll(testevents);
          state.clearEndedInputs();

          state[inputSymbol].forEach(i => {
            expect(i.phase).not.toBe('end');
          });
        });
      });

      describe('hasNoInputs', () => {
        test('Is true if the state has no inputs', () => {
          expect(state.hasNoInputs()).toBe(true);
        });

        test('Is false if the state has any inputs', () => {
          sendAll(startevents);
          expect(state.hasNoInputs()).toBe(false);
        });

        test('Is true again after inputs are cleared', () => {
          sendAll(startevents);
          expect(state.hasNoInputs()).toBe(false);

          sendAll(endevents);
          state.clearEndedInputs();
          expect(state.hasNoInputs()).toBe(true);
        });
      });
    });
  });
});
