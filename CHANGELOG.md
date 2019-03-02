# Changelog

## Releases

- [0.5.2](#052)
- [0.5.0](#050)

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

