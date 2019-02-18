/*
 * Test suite for the State class.
 */

'use strict';

const State = require('../src/State.js');
const Input = require('../src/Input.js');

class MouseEvent {
  constructor(id, target, type, x, y) {
    this.button = id;
    this.target = target;
    this.type = type;
    this.clientX = x;
    this.clientY = y;
  }
}

describe('State', () => {
  let state;
  let startevents;
  let testevents;
  let outerdiv, parentdiv, targetdiv;

  beforeAll(() => {
    outerdiv = document.createElement('div');
    parentdiv = document.createElement('div');
    targetdiv = document.createElement('div');

    document.body.appendChild(outerdiv);
    document.body.appendChild(parentdiv);
    parentdiv.appendChild(targetdiv);

    startevents = [
      new MouseEvent(0, targetdiv, 'mousedown', 42, 43),
      new MouseEvent(1, targetdiv, 'mousedown', 42, 43),
      new MouseEvent(2, targetdiv, 'mousedown', 42, 43),
      new MouseEvent(3, targetdiv, 'mousedown', 42, 43),
      new MouseEvent(4, targetdiv, 'mousedown', 42, 43),
      new MouseEvent(5, targetdiv, 'mousedown', 42, 43),
      new MouseEvent(6, targetdiv, 'mousedown', 42, 43),
    ];

    testevents = [
      new MouseEvent(1, targetdiv, 'mouseup',   43, 40),
      new MouseEvent(2, targetdiv, 'mousemove', 46, 41),
      new MouseEvent(3, targetdiv, 'mousemove', 36, 51),
      new MouseEvent(6, targetdiv, 'mouseup',   32, 47),
    ];
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
    let inputSymbol;
    beforeAll(() => {
      state = new State();
      inputSymbol = Symbol.for('inputs');
    });

    describe('updateInput', () => {
      test('Instantiates a new input for "start" phase events', () => {
        expect(state[inputSymbol].get(0)).toBeFalsy();
        expect(() => state.updateInput(startevents[0], 0)).not.toThrow();
        expect(state[inputSymbol].get(0)).toBeInstanceOf(Input);
      });

      test('Updates an old input for "move" or "end" phase events', () => {
        expect(() => state.updateInput(startevents[1], 1)).not.toThrow();
        expect(state[inputSymbol].get(1).phase).toBe('start');
        expect(() => state.updateInput(testevents[0], 1)).not.toThrow();
        expect(state[inputSymbol].get(1).phase).toBe('end');
      });
    });

    describe('updateAllInputs', () => {
      test('Instantiates new inputs for "start" phase events', () => {
        for (let i = 2; i < startevents.length; i++) {
          expect(state[inputSymbol].get(i)).toBeFalsy();
          expect(() => state.updateAllInputs(startevents[i])).not.toThrow();
          expect(state[inputSymbol].get(i)).toBeInstanceOf(Input);
        }
      });

      test('Updates old inputs for "move" or "end" phase events', () => {
        for (let i = 1; i < testevents.length; i++) {
          expect(() => state.updateAllInputs(testevents[i])).not.toThrow();
        }
        expect(state[inputSymbol].get(2).phase).toBe('move');
        expect(state[inputSymbol].get(3).phase).toBe('move');
        expect(state[inputSymbol].get(6).phase).toBe('end');
      });

      test('Records additional information about state after update', () => {
        expect(state.inputs).toBeDefined();
        expect(state.active).toBeDefined();
        expect(state.activePoints).toBeDefined();
        expect(state.centroid).toBeDefined();
        expect(state.event).toBeDefined();
      });
    });

    describe('getInputsInPhase(phase)', () => {
      describe('start', () => {
        test('Retrieves the right number of inputs', () => {
          expect(state.getInputsInPhase('start').length).toBe(3);
        });

        test('All retrieved inputs are starts', () => {
          state.getInputsInPhase('start').forEach( s => {
            expect(s.phase).toBe('start');
          });
        });

        test('Ids and order persisted', () => {
          const starts = state.getInputsInPhase('start');
          expect(starts[0].identifier).toBe(0);
          expect(starts[1].identifier).toBe(4);
          expect(starts[2].identifier).toBe(5);
        });
      });

      describe('move', () => {
        let moves;
        beforeEach(() => {
          moves = state.getInputsInPhase('move');
        });

        test('Retrieves the right number of inputs', () => {
          expect(moves.length).toBe(2);
        });

        test('All retrieved inputs are moves', () => {
          moves.forEach( m => {
            expect(m.phase).toBe('move');
          });
        });

        test('Ids and order persisted', () => {
          expect(moves[0].identifier).toBe(2);
          expect(moves[1].identifier).toBe(3);
        });
      });

      describe('end', () => {
        let ends;
        beforeEach(() => {
          ends = state.getInputsInPhase('end');
        });

        test('Retrieves the right number of inputs', () => {
          expect(ends.length).toBe(2);
        });

        test('All retrieved inputs are ends', () => {
          ends.forEach( m => {
            expect(m.phase).toBe('end');
          });
        });

        test('Ids and order persisted', () => {
          expect(ends[0].identifier).toBe(1);
          expect(ends[1].identifier).toBe(6);
        });
      });
    });

    describe('getInputsNotInPhase(phase)', () => {
      describe('start', () => {
        let starts;
        beforeEach(() => {
          starts = state.getInputsNotInPhase('start');
        });

        test('Retrieves the right number of inputs', () => {
          expect(starts.length).toBe(4);
        });

        test('All retrieved inputs are not starts', () => {
          starts.forEach( s => {
            expect(s.phase).not.toBe('start');
          });
        });

        test('Ids and order persisted', () => {
          expect(starts[0].identifier).toBe(1);
          expect(starts[1].identifier).toBe(2);
          expect(starts[2].identifier).toBe(3);
          expect(starts[3].identifier).toBe(6);
        });
      });

      describe('move', () => {
        let moves;
        beforeEach(() => {
          moves = state.getInputsNotInPhase('move');
        });

        test('Retrieves the right number of inputs', () => {
          expect(moves.length).toBe(5);
        });

        test('All retrieved inputs are not moves', () => {
          moves.forEach( m => {
            expect(m.phase).not.toBe('move');
          });
        });

        test('Ids and order persisted', () => {
          expect(moves[0].identifier).toBe(0);
          expect(moves[1].identifier).toBe(1);
          expect(moves[2].identifier).toBe(4);
          expect(moves[3].identifier).toBe(5);
          expect(moves[4].identifier).toBe(6);
        });
      });

      describe('end', () => {
        let ends;
        beforeEach(() => {
          ends = state.getInputsNotInPhase('end');
        });

        test('Retrieves the right number of inputs', () => {
          expect(ends.length).toBe(5);
        });

        test('All retrieved inputs are not ends', () => {
          ends.forEach( m => {
            expect(m.phase).not.toBe('end');
          });
        });

        test('Ids and order persisted', () => {
          expect(ends[0].identifier).toBe(0);
          expect(ends[1].identifier).toBe(2);
          expect(ends[2].identifier).toBe(3);
          expect(ends[3].identifier).toBe(4);
          expect(ends[4].identifier).toBe(5);
        });
      });
    });

    describe('clearEndedInputs', () => {
      test('Does not throw an exception', () => {
        expect(() => state.clearEndedInputs()).not.toThrow();
      });

      test('Removes inputs in "end" phase from state', () => {
        state[inputSymbol].forEach(i => {
          expect(i.phase).not.toBe('end');
        });
      });

      test('Ids and order of remaining inputs persisted', () => {
        const inputs = Array.from(state[inputSymbol].values());
        expect(inputs[0].identifier).toBe(0);
        expect(inputs[1].identifier).toBe(2);
        expect(inputs[2].identifier).toBe(3);
        expect(inputs[3].identifier).toBe(4);
        expect(inputs[4].identifier).toBe(5);
      });
    });
  });
});


