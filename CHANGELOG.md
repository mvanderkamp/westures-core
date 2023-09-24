# Changelog

## 1.3.1

- Add 'contextmenu' to CANCEL_EVENTS
- Changed docs deployment strategy

## 1.3.0

- Introduce "headless" mode, which allows westures to be run in a server environment.

## 1.2.0

- Switch to "parcel" from "parcel-bundler"
- Add a list of the PHASES to constants.js
- Provide Input.elapsedTime
- Provide Point2D.anglesTo()

## 1.1.0

- Switch to using pointer events by default, combined with setting touch-action:
  none on the gesture elements (not the region itself).
- Provide options on the Region for choosing whether to prefer pointer events
  over mouse/touch events (preferPointer) and what to set the touch-action
  property to on gesture elements (touchAction).
- Default to using the window as the region if no element provided.
- Add mouseleave to the CANCEL_EVENTS

## 1.0.0

- Official first release! This engine is no longer considered to be in beta.
- Refactor Smoothable to be a data type, not a mixin.
- Remove the Binding class and integrate with the Gesture class. It was more of
  a hindrance than a help on its own.
- Provide automatic detection of enabled and disabled gestures, including using
  keys to enable and disable, in a simple way such that gestures don't need to
  check if their enabled inside their hooks.
- 'cancel' phase is now properly called.
- Region class now takes an optional 'options' object instead of lots of
  arguments.
- Remove the 'getProgressOfGesture' method from the Input class. Gestures should
  track their progress internally, on their own instance!
- Remove the 'radius' property from the outgoing data. It didn't seem useful and
  was just cluttering the output.
- Use Sets for tracking Gestures inside the Region instead of Arrays. (Faster
  access operations).

## 0.6.5

- Update dev support packages and switch to parcel-bundler for the distributable
  instead of browserify. This bundle is now found in the dist/ folder, along
  with a source map. Support for the old 'bundle.js' and 'bundle.min.js' is
  approximately maintained by providing two copies of 'dist/index.js' under
  those names. They will be removed in subsequent releases.

## 0.6.4

- Remove confusing and unnecessary console.warn() statements.

## 0.6.3

- Add a check that ensures smoothing will only ever be applied on devices that
  need it. That is, devices with 'coarse' pointers.

## 0.6.2

- [POSSIBLE BREAKING] But only for those who have implemented their own
  Smoothable gesture with a non-zero identity value (e.g. Rotate has an identity
  of 0, as that represents no change, and Pinch has an identity of 1, as that
  represents no change). Such gestures will now need to declare their own
  identity value *after* calling super() in the constructor.
- The smoothing algorithm used by the Smoothable mixin has been simplified.
  There is no delay to emits, as analysis of the data revealed this really only
  occurred for the first emit. Instead a simple rolling average is maintained.

## 0.6.1

- Add `babelify` transform for bundle. (Add's Edge support, or at least it
  should...)

## 0.6.0

- Add centroid and radius to base emitted data.
- Give preference to gesture's data over base data, in the case of name
  collisions. (So that a gesture can overwrite parts of that data, for example
  if a tap gesture wants to write its own centroid).
- The system now tries to obtain pointer capture on inputs.
- Add radius to state's convenience fields.

## 0.5.3

- Treat 'touchcancel' and 'pointercancel' the same way as 'blur'.
    - This is an unfortunate hack, necessitated by an apparent bug in Chrome,
      wherein only the _first_ (primary?) pointer will receive a 'cancel' event.
      The other's are cancelled, but no event is emitted. Their IDs are reused
      for subsequent pointers, making gesture state recoverable, but this is
      still not a good situation.
    - The downside is that this workaround means that if any single pointer is
      cancelled, _all_ of the pointers are treated as cancelled. I don't have
      enough in depth knowledge to say for sure, but I suspect that this doesn't
      have to be the case. If I have time soon I'll post a ticket to Chrome, at
      the very least to find out if this is actually a bug (my read of the spec
      tells me that it is).
    - The upside is that this should be pretty fail-safe, when combined with the
      'blur' listener on the window.

## 0.5.2

- Add 'cancel' support for touchcancel and pointercancel.
    - For many gestures, it will be the same as 'end', but in some cases it must
      be different, specifically gestures that emit on 'end'.
- Add a 'blur' listener to the window that resets the state when the window
  loses focus. This should help maintain the viability of the system. I'm trying
  it out anyway. Let me know if this causes any serious issues.

## 0.5.0

- Rename Region#bind() -> Region#addGesture() and Region#unbind() ->
  Region#removeGestures().
    - I was not happy with the way that the 'bind' naming clashes with the
      'bind' function on the Function prototype.
- Simplified "unbind" function. It now returns null, as the Bindings should not
  be exposed to the end user.
- Sped up Binding selection in the Region's `arbitrate` function, while
  simultaneously fixing a critical bug!
    - Only the bindings associated with elements on the composed path of the
      first input to touch the surface will be accessed.
    - In other words, this batch of bindings is cached instead of being
      recalculated on every input event.
    - Previously, if the user started one input in one bound element, then
      another input in another bound element, the bindings for both elements
      would think they have full control, leading to some potentially weird
      behaviour.
    - If you want this behaviour, you'll now have to simulate it by creating a
      separate region for each binding.
- Removed Region#getBindingsByInitialPos
- Removed State#someInputWasInitiallyInside
- Improved test coverage a bit

