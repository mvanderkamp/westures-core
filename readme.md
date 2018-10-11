# westures-core

This module contains the core functionality of the Westures JavaScript gesture
library. It is intended for use as a lighter-weight module to use if you do not
intend on using the base gestures included with the standard `westures` module.

Westures is a fork of [ZingTouch](https://github.com/zingchart/zingtouch). 

## Advisory

This is an alpha release of this library. Browser compatability has not been
tested except in the newest stable releases of Chrome and Firefox. Likewise, it
has only been tested on a very small selection of devices. 

That said, please do give it a try, and if something breaks, please let me know!
Or, even better, figure out why it broke, figure out a solution, and submit a
pull request!

## Table of Contents

- [Overview](#overview)
- [Implementing Custom Gestures](#implementing-custom-gestures)

## Overview

There are seven classes defined in this module:

- _Binding_: Bind a Gesture to an element within a Region.
- _Gesture_: Respond to input phase "hooks" to define a gesture.
- _Input_: Track a single pointer through its lifetime, and store the progress
    of gestures associated with that input.
- _Point2D_: Store and act on a 2-dimensional point.
- _PointerData_: Record data pertaining to a single user input event for a
    single pointer.
- _Region_: Listen for user input events and respond appropriately.
- _State_: Track all active Inputs within a Region.

These classes are structured as follows:

```text
Region
  \-Binding
  | \-Gesture
  |
  \-State
    \-Input
      \-PointerData
        \-Point2D
```

## Implementing Custom Gestures

The core technique used by Westures (originally conceived for ZingTouch) is to
process all user inputs and filter them through three key lifecycle phases:
`start`, `move`, and `end`. Gestures are defined by how they respond to these
phases.  To respond to the stages, a gesture extends the `Gesture` class
provided by this module and overrides the method (a.k.a. "hook") corresponding
to the name of the phase. 

