# westures-core

[![Maintainability](
https://api.codeclimate.com/v1/badges/a5f4a4745352d6e2520c/maintainability)
](https://codeclimate.com/github/mvanderkamp/westures-core/maintainability)

This module contains the core functionality of the Westures JavaScript gesture
library. It is intended for use as a lighter-weight module to use if you do not
intend on using the base gestures included with the standard [westures](
https://mvanderkamp.github.io/westures/) module.

Westures is a fork of [ZingTouch](https://github.com/zingchart/zingtouch). 

## Advisory

This is an alpha release of this library. Browser compatability has not been
tested except in the newest stable releases of Chrome and Firefox. Likewise, it
has only been tested on a very small selection of devices. Updates may be
frequent at times, but check back here and in the documentation to see what's
new and what breaking changes might have occurred.

That said, please do give it a try, and if something breaks, please let me know!
Or, even better, figure out why it broke, figure out a solution, and submit a
pull request!

## Table of Contents

- [Overview](#overview)
- [Basic Usage](#basic-usage)
- [Implementing Custom Gestures](#implementing-custom-gestures)
- [What's Changed](#changes-from-zingtouch)
- [Links](#links)

## Overview

There are seven classes defined in this module:

- _Binding:_ Bind a Gesture to an element within a Region.
- _Gesture:_ Respond to input phase "hooks" to define a gesture.
- _Input:_ Track a single pointer through its lifetime, and store the progress
    of gestures associated with that input.
- _Point2D:_ Store and act on a 2-dimensional point.
- _PointerData:_ Record data pertaining to a single user input event for a
    single pointer.
- _Region:_ Listen for user input events and respond appropriately.
- _State:_ Track all active Inputs within a Region.

These classes are structured as follows:

```text
Region
  \-Binding
  |  \-Gesture
  |
  \-State
     \-Input
        \-PointerData
           \-Point2D
```
## Basic Usage

### Importing the module

```javascript
const wes = require('westures-core');
```

### Declaring a Region

First, decide what region should listen for events. If you want elements to
continue to respond to input events from the `move` and `end` phases even if the
pointer moves outside the element, you should use a region that contains the
element. This can even be the window object if you want these events to fire
event if the pointer goes outside the browser window.

For example:

```javascript
const region = new wes.Region(window);
```

Of course, if you have lots of interactable elements on your page, you may want
to consider using smaller elements as binding regions, or event the interactable
element itself.

For example, if you have a canvas element with id `draw-struff` that you want to
interact with, you could do:

```javascript
const region = new wes.Region(document.querySelector('#draw-stuff'));
```

### Binding an element within a Region

When you bind a gesture to a region, you need to provide a handler as well as an
Element for the binding. The gesture will only be recognized if at least one of
the input points originated inside the given Element for a binding. Therefore
unless you want to try something fancy the binding element should probably be
contained inside the region element. It could even be the region element.

Now for an example. Suppose you have a div (id 'pannable') within which you want
to detect a Pan gesture (assume that such a gesture is available). Your handler
is called `panner`.

```javascript
region.bind(document.querySelector('#pannable'), new Pan(), panner);
```

The `panner` function will now be called whenever a Pan hook returns non-null
data. The data returned by the hook will be available inside `panner` as such:

```javascript
function panner(data) {
  // data.x ...
  // data.y ...
  // and so on, depending on the Gesture
}
```

## Implementing Custom Gestures

The core technique used by Westures (originally conceived for ZingTouch) is to
process all user inputs and filter them through three key lifecycle phases:
`start`, `move`, and `end`. Gestures are defined by how they respond to these
phases.  To respond to the phases, a gesture extends the `Gesture` class
provided by this module and overrides the method (a.k.a. "hook") corresponding
to the name of the phase. 

The hook, when called, will receive the current State object of the region. To
maintain responsiveness, the functionality within a hook should be short and as
efficient as possible.

For example, a simple way to implement a 'Tap' gesture would be as follows:

```javascript
const { Gesture } = require('westures-core');

class Tap extends Gesture {
  constructor() {
    super('tap');
  }

  end(state) {
    const {x,y} = state.getInputsInPhase('end')[0].current.point;
    return {x,y};
  }
}
```

There are problems with this example, so I don't recommend using it as an actual
Tap gesture, but it gives you the basic idea.

The default hooks for all Gestures simply return null. Data will only be
forwarded to bound handlers when a non-null value is returned by a hook.

For information about what data is accessible via the State object, see the full
documentation [here](https://mvanderkamp.github.io/westures-core/index.html).
Note that his documentation was generated with `jsdoc`.

### Storing the "progress" of a Gesture

One of the key facilities made available via the `state` object that a hook
receives is the ability to store intermediate progress on a per-gesture and
per-input basis. This is done via the `getProgressOfGesture` method on any given
input. 

Here is a simple Pan example, where we keep track of what data was last emitted
using this progress capability.

```javascript
const { Gesture } = require('westures-core');

class Pan extends Gesture {
  constructor() {
    super('pan');
  }

  start(state) {
    const progress = state.active[0].getProgressOfGesture(this.id);
    progress.lastEmit = state.centroid;
  }

  move(state) {
    const progress = state.active[0].getProgressOfGesture(this.id);
    const change = state.centroid.minus(progress.lastEmit);
    progress.lastEmit = state.centroid;
    return {
      change,
      centroid: state.centroid,
    };
  }

  end(state) {
    const progress = state.active[0].getProgressOfGesture(this.id);
    progress.lastEmit = state.centroid;
  }
}
```

In fact, this example is very close to the Pan implementation that is included
in the `westures` module.

### Data Passed to Handlers

As you can see from above, it is the gesture which decides when data gets passed
to handlers, and for the most part what that data will be. Note though that a
few propertiess will get added to the outgoing data object before the handler is
called. Those properties are:

Name  | Type   | Value
------|--------|-------
event | Event  | The input event which caused the gesture to be recognized
phase | String | 'start', 'move', or 'end'
type  | String | The name of the gesture as specified by its designer.

## Changes From ZingTouch

The fundamental idea of ZingTouch, the three-phase hook structure, remains more
or less the same. Most of the changes have to do with streamlining and
simplifying the code such that it is easier to use and has a wider range of
capabilities. The most significant of these is full simultaneous multi-touch
gesture support. Beyond that, here are some spefic changes:

- Reorganized and simplified code structure.
  - The arbiter-interpreter-dispatcher scheme has been significantly simplified.
    - There is no arbiter. instead the Region class has an 'arbitrate' function.
    - There is no interpreter. Instead the Binding class has an 'evaluateHook'
      function.
    - There is no dispatcher. The handlers are called directly.
  - Fewer levels of code and fewer attempts to ram multiple types of
    functionality into a single function. I've tried to keep all functions clear
    and simple.
- Creation and use of a Point2D class.
- Redesigned technique for handling inputs allows continuous use of touches.
  ZingTouch had a tendency to stop responding to touches if some gesture ended,
  this should no longer be the case. Users should now be able to seamlessly flow
  from one gesture to another (or even multiple simultaneously) without having
  to restart their touches.
- Support for using the window object as a region.
- Simplified hook interaction. A single 'state' object is passed, as that is
  all that is really needed.
- Simplified handler interaction. As the handlers are called directly instead of
  as the callback for an event, the parameters do not need to be wrapped up
  inside the 'details' property of an event object.

## Links

### westures

- [npm](https://www.npmjs.com/package/westures)
- [github](https://github.com/mvanderkamp/westures)
- [documentation](https://mvanderkamp.github.io/westures/)

### westures-core

- [npm](https://www.npmjs.com/package/westures-core)
- [github](https://github.com/mvanderkamp/westures-core)
- [documentation](https://mvanderkamp.github.io/westures-core/)

