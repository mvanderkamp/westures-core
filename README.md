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

Westures is a robust n-pointer multitouch gesture detection library for
JavaScript. This means that each gesture is be capable of working seamlessly as
input points are added and removed, with no limit on the number of input points,
and with each input point contributing to the gesture.  It is also capable of
working across a wide range of devices.

This module contains the core functionality of the Westures gesture library for
JavaScript. It is intended for use as a lighter-weight module to use if you do
not want to use the base gestures included with the standard [westures](
https://mvanderkamp.github.io/westures/) module.

Visit this page for an example of the system in action: [Westures Example](
https://mvanderkamp.github.io/westures-example/).

Westures aims to achieve its goals without using any dependencies, yet maintain
usability across the main modern browsers. Transpilation may be necessary for
this last point to be achieved, as the library is written using many of the
newer features of the JavaScript language. A transpiled bundle is provided, but
the browser target list is arbitrary and likely includes some bloat. In most
cases you will be better off performing bundling, transpilation, and
minification yourself.

Westures is a fork of [ZingTouch](https://github.com/zingchart/zingtouch).

## Quick Example

```javascript
// Import the module.
const wes = require('westures-core');

// Declare a region. The default is the window object, but other elements like
// the document body work too.
const region = new wes.Region();

// Define a Gesture subclass
class Follow extends wes.Gesture {
  move(state) {
    return state.centroid; // Reports the {x, y} of the average input position
  }
}

// Locate an element to attach the gesture to.
const element = document.querySelector('#follow');

// Instantiate a Gesture for an element within the region.
const follow = new Follow(element, (data) => {
  // data.x ...
  // data.y ...
});

// Add the gesture to the region.
region.addGesture(follow);
```

## Table of Contents

- [Features](#features)
- [Overview](#overview)
- [Basic Usage](#basic-usage)
- [Implementing Custom Gestures](#implementing-custom-gestures)
- [Nomenclature and Origins](#nomenclature-and-origins)
- [Changes](#changes)
- [Issues](#issues)
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
      the equivalent behaviour as multi-pointer flows. For example, holding
      'CTRL' on a desktop could switch from panning mode to rotating mode.
- Allows for easy implementation and integration of custom gestures using the
  four-phase hook structure.

## Overview

There are seven classes made available by this module:

Name        | Description
----------- | -----------
Gesture     | Base class for defining westures gestures
Input       | Track a single pointer through its lifetime
Point2D     | Store and act on a 2-dimensional point
PointerData | Record data pertaining to a single user input event for a single pointer.
Region      | Listen for user input events and respond appropriately
Smoothable  | Datatype which provides inertial smoothing capabilities
State       | Track inputs within a Region

Additionally, two support files are defined:

Name      | Description
--------- | -----------
constants | Constant values used throughout the engine
utils     | Helpful utility functions

## Basic Usage

- [Declaring a Region](#declaring-a-region)
- [Defining a Gesture Subclass](#defining-a-gesture-subclass)
- [Instantiating a Gesture](#instantiating-a-gesture)
- [Adding a Gesture to a Region](#adding-a-gesture-to-a-region)

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

By default, the window object is used.

```javascript
const region = new wes.Region(document.body);
```

### Defining a Gesture Subclass

In order to use the engine, you'll need to define gestures. This is done by
extending the Gesture class provided by this module, and overriding any or all
of the four phase hooks ('start', 'move', 'end', and 'cancel') as is appropriate
for your gesture.

Defined here is a very simple gesture that simply reports the centroid of the
input points. Note that the returned value must be an Object!

```javascript
// Define a Gesture subclass
class Follow extends wes.Gesture {
  move(state) {
    return state.centroid;
  }
}
```

### Instantiating a Gesture

When you instantiate a gesture, you need to provide a handler as well as an
Element. The gesture will only be recognized when the first pointer to interact
with the region was inside the given Element. Therefore unless you want to try
something fancy the gesture element should probably be contained inside the
region element. It could even be the region element.

Now for an example. Suppose you have a div within which you want to detect the
Follow gesture we defined above. The div has id 'follow'. We need to find the
element first.

```javascript
const element = document.querySelector('#follow');
```

And we also need a handler. This function will be called whenever a gesture hook
returns non-null data. For Follow, this is just the move phase, but the handler
doesn't need to know that. The data returned by the hook will be available
inside the handler.

```javascript
function followLogger(data) {
  console.log(
    'The centroid of the points interacting with #follow is:',
    'x:', data.x,
    'y:', data.y,
  )
}
```

Now we're ready to combine the element and its handler into a gesture.

```javascript
const follow = new Follow(element, followLogger);
```

We're not quite done though, as none of this will actually work until you add
the gesture to the region.

### Adding a Gesture to a Region

Simple:

```javascript
region.addGesture(follow);
```

Now the `followLogger` function will be called whenever a `follow` gesture is
detected on the `#follow` element inside the region.

## Implementing Custom Gestures

The core technique used by Westures is to process all user inputs and filter
them through four key lifecycle phases: `start`, `move`, `end`, and `cancel`.
Gestures are defined by how they respond to these phases. To respond to the
phases, a gesture extends the `Gesture` class provided by this module and
overrides the method (a.k.a. "hook") corresponding to the name of the phase.

The hook, when called, will receive the current State object of the region. To
maintain responsiveness, the functionality within a hook should be short and as
efficient as possible.

For example, a simple way to implement a `Tap` gesture would be as follows:

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

If your Gesture subclass needs to track any kind of complex state, remember that
it may be necessary to reset the state in the `cancel` phase.

For information about what data is accessible via the State object, see the full
documentation [here](https://mvanderkamp.github.io/westures-core/westures-core.State.html).
Note that his documentation was generated with `jsdoc`.

### Default Data Passed to Handlers

As you can see from above, it is the gesture which decides when data gets passed
to handlers, and for the most part what that data will be. Note though that a
few properties will get added to the outgoing data object before the handler is
called. Those properties are:

Name     | Type     | Value
-------- | -------- | -----
centroid | Point2D  | The centroid of the input points.
event    | Event    | The input event which caused the gesture to be recognized
phase    | String   | `'start'`, `'move'`, `'end'`, or `'cancel'`
type     | String   | The name of the gesture as specified by its designer.
target   | Element  | The Element that is associated with the recognized gesture.

If data properties returned by a hook have a name collision with one of these
properties, the value from the hook gets precedent and the default is
overwritten.

## Nomenclature and Origins

In my last year of univerisity, I was working on an API for building
multi-device interfaces called "WAMS" (Workspaces Across Multiple Surfaces),
which included the goal of supporting multi-device gestures.

After an extensive search I found that none of the available multitouch
libraries for JavaScript provided the fidelity I needed, and concluded that I
would need to write my own, or at least fork an existing one. ZingTouch proved
to the be the most approachable, so I decided it would make a good starting
point.

The name "westures" is a mash-up of "WAMS" and "gestures".

## Changes

See the [changelog](
https://github.com/mvanderkamp/westures-core/blob/master/CHANGELOG.md) for the
most recent updates.

## Issues

If you find any issues, please let me know!

## Links

### westures

- [npm](https://www.npmjs.com/package/westures)
- [github](https://github.com/mvanderkamp/westures)
- [documentation](https://mvanderkamp.github.io/westures/)

### westures-core

- [npm](https://www.npmjs.com/package/westures-core)
- [github](https://github.com/mvanderkamp/westures-core)
- [documentation](https://mvanderkamp.github.io/westures-core/)

