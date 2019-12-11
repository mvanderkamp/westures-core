# westures-core

[![Build Status](
https://travis-ci.org/mvanderkamp/westures-core.svg?branch=master)
](https://travis-ci.org/mvanderkamp/westures-core)
[![Coverage Status](
https://coveralls.io/repos/github/mvanderkamp/westures-core/badge.svg?branch=master)
](https://coveralls.io/github/mvanderkamp/westures-core?branch=master)
[![Maintainability](
https://api.codeclimate.com/v1/badges/a5f4a4745352d6e2520c/maintainability)
](https://codeclimate.com/github/mvanderkamp/westures-core/maintainability)

This module contains the core functionality of the Westures JavaScript gesture
library. It is intended for use as a lighter-weight module to use if you do not
intend on using the base gestures included with the standard [westures](
https://mvanderkamp.github.io/westures/) module.

Visit this page for an example of the system in action: [Westures Example](
https://mvanderkamp.github.io/westures-example/). Note that this is best viewed
on a touch device.

Westures is a fork of [ZingTouch](https://github.com/zingchart/zingtouch).

## Quick Example

```javascript
// Import the module.
const wes = require('westures-core');

// Declare a region. The document body is probably a good one to use.
const region = new wes.Region(document.body);

// Instantiate a Gesture for an element within the region.
// Assumes a Pan gesture is available, and that the element you want to pan has
// been saved in the `element` variable.
const pan = new Pan(element, (data) => {
  // data.translation.x ...
  // data.translation.y ...
  // and so on, depending on the Gesture
});

// Add the gesture to the region.
region.addGesture(pan);
```

## Table of Contents

- [Features](#features)
- [Overview](#overview)
- [Basic Usage](#basic-usage)
- [Implementing Custom Gestures](#implementing-custom-gestures)
- [Links](#links)

## Features

- Full simultaneous multi-touch gesture support.
    - Continuous use of pointer input allows seamless flow from gesture to
      gesture without interruption.
- Robust, simple to understand, easy to maintain engine.
- Inertial smoothing capabilities for systems using coarse pointers (e.g. touch
  surfaces).
- Ability to enable / disable gestures with keys (e.g. ctrlKey, shiftKey)
    - This allows for easy implementation of single-pointer flows that provide
      the same behaviour as multi-pointer flows. For example, holding 'CTRL' on
      a desktop could switch from panning mode to rotating mode.
- Allows for easy implementation and integration of custom gestures using the
  four-phase hook structure.

## Overview

There are seven classes defined in this module:

- _Gesture:_ Respond to input phase "hooks" to define a gesture.
- _Input:_ Track a single pointer through its lifetime, and store the progress
    of gestures associated with that input.
- _Point2D:_ Store and act on a 2-dimensional point.
- _PointerData:_ Record data pertaining to a single user input event for a
    single pointer.
- _Region:_ Listen for user input events and respond appropriately.
- _Smoothable:_ Datatype which provides inertial smoothing capabilities.
- _State:_ Track all active Inputs within a Region.

Additionally, two support files are defined:

- _constants:_ Constant values used throughout the engine.
- _utils:_ Helpful utility functions.

These classes are structured as follows:

![Graph of westures-core module](
https://raw.githubusercontent.com/mvanderkamp/westures-core/master/arkit.svg?sanitize=true)

## Basic Usage

### Importing the module

```javascript
const wes = require('westures-core');
```

### Declaring a Region

First, decide what region should listen for events. This could be the
interactable element itself, or a larger region (possibly containing many
interactable elements). Behaviour may differ slightly based on the approach you
take, as a Region will perform locking operations on its interactable elements
and their bound gestures so as to limit interference between elements during
gestures, and no such locking occurs between Regions.

If you have lots of interactable elements on your page, you may find it
convenient to use smaller elements as regions. Test it out in any case, and see
what works better for you.

```javascript
const region = new wes.Region(document.body);
```
### Instantiating a Gesture

When you instantiate a gesture, you need to provide a handler as well as an
Element. The gesture will only be recognized when the first pointer to interact
with the region was inside the given Element. Therefore unless you want to try
something fancy the gesture element should probably be contained inside the
region element. It could even be the region element.

Now for an example. Suppose you have a div within which you want to detect a Pan
gesture (assume that such a gesture is available). Your handler is called
`handler`, and the div is saved in the `element` variable.

```javascript
const pan = new Pan(element, handler);
```

The `handler` function will be called whenever a Pan hook returns non-null data.
The data returned by the hook will be available inside `handler` as such:

```javascript
function handler(data) {
  // data.translation.x ...
  // data.translation.y ...
  // and so on, depending on the gesture
}
```

That said, none of this will actually work until you add the gesture to the
region.

### Adding a Gesture to a Region

Simple:

```javascript
region.addGesture(pan);
```

Now the `handler` function will be called whenever a `pan` gesture is detected
on the `#pannable` element inside the region.

## Implementing Custom Gestures

The core technique used by Westures is to process all user inputs and filter
them through four key lifecycle phases: `start`, `move`, `end`, and `cancel`.
Gestures are defined by how they respond to these phases. To respond to the
phases, a gesture extends the `Gesture` class provided by this module and
overrides the method (a.k.a. "hook") corresponding to the name of the phase.

The hook, when called, will receive the current State object of the region. To
maintain responsiveness, the functionality within a hook should be short and as
efficient as possible.

For example, a simple way to implement a 'Tap' gesture would be as follows:

```javascript
const { Gesture } = require('westures-core');

const TIMEOUT = 100;

class Tap extends Gesture {
  constructor() {
    super('tap');
    this.startTime = null;
  }

  start(state) {
    this.startTime = Date.now();
  }

  end(state) {
    if (Date.now() - this.startTime <= TIMEOUT) {
        return state.getInputsInPhase('end')[0].current.point;
    }
    return null;
  }
}
```

There are problems with this example, and it should probably not be used as an
actual Tap gesture, it is merely to illustrate the basic idea.

The default hooks for all Gestures simply return null. Data will only be
forwarded to bound handlers when a non-null value is returned by a hook.
Returned values should be packed inside an object. For example, instead of just
`return 42;`, a custom hook should do `return { value: 42 };`

For information about what data is accessible via the State object, see the full
documentation [here](https://mvanderkamp.github.io/westures-core/State.html).
Note that his documentation was generated with `jsdoc`.

### Default Data Passed to Handlers

As you can see from above, it is the gesture which decides when data gets passed
to handlers, and for the most part what that data will be. Note though that a
few properties will get added to the outgoing data object before the handler is
called. Those properties are:

Name     | Type    | Value
---------|---------|-------
centroid | Point2D | The centroid of the input points.
event    | Event   | The input event which caused the gesture to be recognized
phase    | String  | 'start', 'move', or 'end'
type     | String  | The name of the gesture as specified by its designer.
target   | Element | The Element that is associated with the recognized gesture.

If data properties returned by a hook clashes with one of these properties, the
value from the hook gets precedent and the default is overwritten.

## Changes

See the [changelog](
https://github.com/mvanderkamp/westures-core/blob/master/CHANGELOG.md) for the
most recent updates.

## Issues

If you find any compatibility issues, please let me know!

## Links

### westures

- [npm](https://www.npmjs.com/package/westures)
- [github](https://github.com/mvanderkamp/westures)
- [documentation](https://mvanderkamp.github.io/westures/)

### westures-core

- [npm](https://www.npmjs.com/package/westures-core)
- [github](https://github.com/mvanderkamp/westures-core)
- [documentation](https://mvanderkamp.github.io/westures-core/)

