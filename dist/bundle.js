(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.westuresCore = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * The global API interface for Westures. Exposes a constructor for the Region
 * and the generic Gesture class for user gestures to implement, as well as the
 * Point2D class, which may be useful.
 *
 * @namespace westures-core
 */
'use strict';

const Gesture = require('./src/Gesture.js');

const Point2D = require('./src/Point2D.js');

const Region = require('./src/Region.js');

const Smoothable = require('./src/Smoothable.js');

module.exports = {
  Gesture,
  Point2D,
  Region,
  Smoothable
};

},{"./src/Gesture.js":64,"./src/Point2D.js":67,"./src/Region.js":69,"./src/Smoothable.js":70}],2:[function(require,module,exports){
var UNSCOPABLES = require('../internals/well-known-symbol')('unscopables');
var create = require('../internals/object-create');
var hide = require('../internals/hide');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) {
  hide(ArrayPrototype, UNSCOPABLES, create(null));
}

// add a key to Array.prototype[@@unscopables]
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};

},{"../internals/hide":21,"../internals/object-create":33,"../internals/well-known-symbol":59}],3:[function(require,module,exports){
var isObject = require('../internals/is-object');

module.exports = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};

},{"../internals/is-object":27}],4:[function(require,module,exports){
var toIndexedObject = require('../internals/to-indexed-object');
var toLength = require('../internals/to-length');
var toAbsoluteIndex = require('../internals/to-absolute-index');

// `Array.prototype.{ indexOf, includes }` methods implementation
// false -> Array#indexOf
// https://tc39.github.io/ecma262/#sec-array.prototype.indexof
// true  -> Array#includes
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"../internals/to-absolute-index":51,"../internals/to-indexed-object":52,"../internals/to-length":54}],5:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],6:[function(require,module,exports){
var has = require('../internals/has');
var ownKeys = require('../internals/own-keys');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var definePropertyModule = require('../internals/object-define-property');

module.exports = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};

},{"../internals/has":19,"../internals/object-define-property":35,"../internals/object-get-own-property-descriptor":36,"../internals/own-keys":44}],7:[function(require,module,exports){
module.exports = !require('../internals/fails')(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

},{"../internals/fails":16}],8:[function(require,module,exports){
'use strict';
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var create = require('../internals/object-create');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var setToStringTag = require('../internals/set-to-string-tag');
var Iterators = require('../internals/iterators');

var returnThis = function () { return this; };

module.exports = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(1, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  Iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};

},{"../internals/create-property-descriptor":9,"../internals/iterators":30,"../internals/iterators-core":29,"../internals/object-create":33,"../internals/set-to-string-tag":48}],9:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],10:[function(require,module,exports){
'use strict';
var $export = require('../internals/export');
var createIteratorConstructor = require('../internals/create-iterator-constructor');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var setToStringTag = require('../internals/set-to-string-tag');
var hide = require('../internals/hide');
var redefine = require('../internals/redefine');
var IS_PURE = require('../internals/is-pure');
var ITERATOR = require('../internals/well-known-symbol')('iterator');
var Iterators = require('../internals/iterators');
var IteratorsCore = require('../internals/iterators-core');
var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf) {
          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
        } else if (typeof CurrentIteratorPrototype[ITERATOR] != 'function') {
          hide(CurrentIteratorPrototype, ITERATOR, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
    }
  }

  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    INCORRECT_VALUES_NAME = true;
    defaultIterator = function values() { return nativeIterator.call(this); };
  }

  // define iterator
  if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
    hide(IterablePrototype, ITERATOR, defaultIterator);
  }
  Iterators[NAME] = defaultIterator;

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine(IterablePrototype, KEY, methods[KEY]);
      }
    } else $export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  return methods;
};

},{"../internals/create-iterator-constructor":8,"../internals/export":15,"../internals/hide":21,"../internals/is-pure":28,"../internals/iterators":30,"../internals/iterators-core":29,"../internals/object-get-prototype-of":39,"../internals/object-set-prototype-of":43,"../internals/redefine":45,"../internals/set-to-string-tag":48,"../internals/well-known-symbol":59}],11:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('../internals/fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"../internals/fails":16}],12:[function(require,module,exports){
var isObject = require('../internals/is-object');
var document = require('../internals/global').document;
// typeof document.createElement is 'object' in old IE
var exist = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return exist ? document.createElement(it) : {};
};

},{"../internals/global":18,"../internals/is-object":27}],13:[function(require,module,exports){
// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
module.exports = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};

},{}],14:[function(require,module,exports){
// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

},{}],15:[function(require,module,exports){
var global = require('../internals/global');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var hide = require('../internals/hide');
var redefine = require('../internals/redefine');
var setGlobal = require('../internals/set-global');
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var isForced = require('../internals/is-forced');

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      hide(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};

},{"../internals/copy-constructor-properties":6,"../internals/global":18,"../internals/hide":21,"../internals/is-forced":26,"../internals/object-get-own-property-descriptor":36,"../internals/redefine":45,"../internals/set-global":47}],16:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],17:[function(require,module,exports){
module.exports = require('../internals/shared')('native-function-to-string', Function.toString);

},{"../internals/shared":50}],18:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports = typeof window == 'object' && window && window.Math == Math ? window
  : typeof self == 'object' && self && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();

},{}],19:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;

module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],20:[function(require,module,exports){
module.exports = {};

},{}],21:[function(require,module,exports){
var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = require('../internals/descriptors') ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"../internals/create-property-descriptor":9,"../internals/descriptors":11,"../internals/object-define-property":35}],22:[function(require,module,exports){
var document = require('../internals/global').document;

module.exports = document && document.documentElement;

},{"../internals/global":18}],23:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('../internals/descriptors') && !require('../internals/fails')(function () {
  return Object.defineProperty(require('../internals/document-create-element')('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

},{"../internals/descriptors":11,"../internals/document-create-element":12,"../internals/fails":16}],24:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var fails = require('../internals/fails');
var classof = require('../internals/classof-raw');
var split = ''.split;

module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

},{"../internals/classof-raw":5,"../internals/fails":16}],25:[function(require,module,exports){
var NATIVE_WEAK_MAP = require('../internals/native-weak-map');
var isObject = require('../internals/is-object');
var hide = require('../internals/hide');
var objectHas = require('../internals/has');
var sharedKey = require('../internals/shared-key');
var hiddenKeys = require('../internals/hidden-keys');
var WeakMap = require('../internals/global').WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP) {
  var store = new WeakMap();
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  set = function (it, metadata) {
    wmset.call(store, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store, it) || {};
  };
  has = function (it) {
    return wmhas.call(store, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    hide(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return objectHas(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

},{"../internals/global":18,"../internals/has":19,"../internals/hidden-keys":20,"../internals/hide":21,"../internals/is-object":27,"../internals/native-weak-map":32,"../internals/shared-key":49}],26:[function(require,module,exports){
var fails = require('../internals/fails');
var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;

},{"../internals/fails":16}],27:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],28:[function(require,module,exports){
module.exports = false;

},{}],29:[function(require,module,exports){
'use strict';
var getPrototypeOf = require('../internals/object-get-prototype-of');
var hide = require('../internals/hide');
var has = require('../internals/has');
var IS_PURE = require('../internals/is-pure');
var ITERATOR = require('../internals/well-known-symbol')('iterator');
var BUGGY_SAFARI_ITERATORS = false;

var returnThis = function () { return this; };

// `%IteratorPrototype%` object
// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

if (IteratorPrototype == undefined) IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
if (!IS_PURE && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);

module.exports = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};

},{"../internals/has":19,"../internals/hide":21,"../internals/is-pure":28,"../internals/object-get-prototype-of":39,"../internals/well-known-symbol":59}],30:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"dup":20}],31:[function(require,module,exports){
// Chrome 38 Symbol has incorrect toString conversion
module.exports = !require('../internals/fails')(function () {
  // eslint-disable-next-line no-undef
  String(Symbol());
});

},{"../internals/fails":16}],32:[function(require,module,exports){
var nativeFunctionToString = require('../internals/function-to-string');
var WeakMap = require('../internals/global').WeakMap;

module.exports = typeof WeakMap === 'function' && /native code/.test(nativeFunctionToString.call(WeakMap));

},{"../internals/function-to-string":17,"../internals/global":18}],33:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('../internals/an-object');
var defineProperties = require('../internals/object-define-properties');
var enumBugKeys = require('../internals/enum-bug-keys');
var html = require('../internals/html');
var documentCreateElement = require('../internals/document-create-element');
var IE_PROTO = require('../internals/shared-key')('IE_PROTO');
var PROTOTYPE = 'prototype';
var Empty = function () { /* empty */ };

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var length = enumBugKeys.length;
  var lt = '<';
  var script = 'script';
  var gt = '>';
  var js = 'java' + script + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  iframe.src = String(js);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + script + gt + 'document.F=Object' + lt + '/' + script + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (length--) delete createDict[PROTOTYPE][enumBugKeys[length]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : defineProperties(result, Properties);
};

require('../internals/hidden-keys')[IE_PROTO] = true;

},{"../internals/an-object":3,"../internals/document-create-element":12,"../internals/enum-bug-keys":14,"../internals/hidden-keys":20,"../internals/html":22,"../internals/object-define-properties":34,"../internals/shared-key":49}],34:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var definePropertyModule = require('../internals/object-define-property');
var anObject = require('../internals/an-object');
var objectKeys = require('../internals/object-keys');

module.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var i = 0;
  var key;
  while (length > i) definePropertyModule.f(O, key = keys[i++], Properties[key]);
  return O;
};

},{"../internals/an-object":3,"../internals/descriptors":11,"../internals/object-define-property":35,"../internals/object-keys":41}],35:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');
var anObject = require('../internals/an-object');
var toPrimitive = require('../internals/to-primitive');
var nativeDefineProperty = Object.defineProperty;

exports.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"../internals/an-object":3,"../internals/descriptors":11,"../internals/ie8-dom-define":23,"../internals/to-primitive":56}],36:[function(require,module,exports){
var DESCRIPTORS = require('../internals/descriptors');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var toIndexedObject = require('../internals/to-indexed-object');
var toPrimitive = require('../internals/to-primitive');
var has = require('../internals/has');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');
var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

exports.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};

},{"../internals/create-property-descriptor":9,"../internals/descriptors":11,"../internals/has":19,"../internals/ie8-dom-define":23,"../internals/object-property-is-enumerable":42,"../internals/to-indexed-object":52,"../internals/to-primitive":56}],37:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var internalObjectKeys = require('../internals/object-keys-internal');
var hiddenKeys = require('../internals/enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};

},{"../internals/enum-bug-keys":14,"../internals/object-keys-internal":40}],38:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],39:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('../internals/has');
var toObject = require('../internals/to-object');
var IE_PROTO = require('../internals/shared-key')('IE_PROTO');
var CORRECT_PROTOTYPE_GETTER = require('../internals/correct-prototype-getter');
var ObjectPrototype = Object.prototype;

module.exports = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectPrototype : null;
};

},{"../internals/correct-prototype-getter":7,"../internals/has":19,"../internals/shared-key":49,"../internals/to-object":55}],40:[function(require,module,exports){
var has = require('../internals/has');
var toIndexedObject = require('../internals/to-indexed-object');
var arrayIndexOf = require('../internals/array-includes')(false);
var hiddenKeys = require('../internals/hidden-keys');

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"../internals/array-includes":4,"../internals/has":19,"../internals/hidden-keys":20,"../internals/to-indexed-object":52}],41:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};

},{"../internals/enum-bug-keys":14,"../internals/object-keys-internal":40}],42:[function(require,module,exports){
'use strict';
var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = nativeGetOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = nativeGetOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;

},{}],43:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var validateSetPrototypeOfArguments = require('../internals/validate-set-prototype-of-arguments');

module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () { // eslint-disable-line
  var correctSetter = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    correctSetter = test instanceof Array;
  } catch (e) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    validateSetPrototypeOfArguments(O, proto);
    if (correctSetter) setter.call(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

},{"../internals/validate-set-prototype-of-arguments":58}],44:[function(require,module,exports){
var getOwnPropertyNamesModule = require('../internals/object-get-own-property-names');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var anObject = require('../internals/an-object');
var Reflect = require('../internals/global').Reflect;

// all object keys, includes non-enumerable and symbols
module.exports = Reflect && Reflect.ownKeys || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};

},{"../internals/an-object":3,"../internals/global":18,"../internals/object-get-own-property-names":37,"../internals/object-get-own-property-symbols":38}],45:[function(require,module,exports){
var global = require('../internals/global');
var hide = require('../internals/hide');
var has = require('../internals/has');
var setGlobal = require('../internals/set-global');
var nativeFunctionToString = require('../internals/function-to-string');
var InternalStateModule = require('../internals/internal-state');
var getInternalState = InternalStateModule.get;
var enforceInternalState = InternalStateModule.enforce;
var TEMPLATE = String(nativeFunctionToString).split('toString');

require('../internals/shared')('inspectSource', function (it) {
  return nativeFunctionToString.call(it);
});

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has(value, 'name')) hide(value, 'name', key);
    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
  }
  if (O === global) {
    if (simple) O[key] = value;
    else setGlobal(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else hide(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState(this).source || nativeFunctionToString.call(this);
});

},{"../internals/function-to-string":17,"../internals/global":18,"../internals/has":19,"../internals/hide":21,"../internals/internal-state":25,"../internals/set-global":47,"../internals/shared":50}],46:[function(require,module,exports){
// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};

},{}],47:[function(require,module,exports){
var global = require('../internals/global');
var hide = require('../internals/hide');

module.exports = function (key, value) {
  try {
    hide(global, key, value);
  } catch (e) {
    global[key] = value;
  } return value;
};

},{"../internals/global":18,"../internals/hide":21}],48:[function(require,module,exports){
var defineProperty = require('../internals/object-define-property').f;
var has = require('../internals/has');
var TO_STRING_TAG = require('../internals/well-known-symbol')('toStringTag');

module.exports = function (it, TAG, STATIC) {
  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
    defineProperty(it, TO_STRING_TAG, { configurable: true, value: TAG });
  }
};

},{"../internals/has":19,"../internals/object-define-property":35,"../internals/well-known-symbol":59}],49:[function(require,module,exports){
var shared = require('../internals/shared')('keys');
var uid = require('../internals/uid');

module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"../internals/shared":50,"../internals/uid":57}],50:[function(require,module,exports){
var global = require('../internals/global');
var setGlobal = require('../internals/set-global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || setGlobal(SHARED, {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.0.0',
  mode: require('../internals/is-pure') ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});

},{"../internals/global":18,"../internals/is-pure":28,"../internals/set-global":47}],51:[function(require,module,exports){
var toInteger = require('../internals/to-integer');
var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(length, length).
module.exports = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};

},{"../internals/to-integer":53}],52:[function(require,module,exports){
// toObject with fallback for non-array-like ES3 strings
var IndexedObject = require('../internals/indexed-object');
var requireObjectCoercible = require('../internals/require-object-coercible');

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};

},{"../internals/indexed-object":24,"../internals/require-object-coercible":46}],53:[function(require,module,exports){
var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger
module.exports = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};

},{}],54:[function(require,module,exports){
var toInteger = require('../internals/to-integer');
var min = Math.min;

// `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"../internals/to-integer":53}],55:[function(require,module,exports){
var requireObjectCoercible = require('../internals/require-object-coercible');

// `ToObject` abstract operation
// https://tc39.github.io/ecma262/#sec-toobject
module.exports = function (argument) {
  return Object(requireObjectCoercible(argument));
};

},{"../internals/require-object-coercible":46}],56:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('../internals/is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"../internals/is-object":27}],57:[function(require,module,exports){
var id = 0;
var postfix = Math.random();

module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + postfix).toString(36));
};

},{}],58:[function(require,module,exports){
var isObject = require('../internals/is-object');
var anObject = require('../internals/an-object');

module.exports = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) {
    throw TypeError("Can't set " + String(proto) + ' as a prototype');
  }
};

},{"../internals/an-object":3,"../internals/is-object":27}],59:[function(require,module,exports){
var store = require('../internals/shared')('wks');
var uid = require('../internals/uid');
var Symbol = require('../internals/global').Symbol;
var NATIVE_SYMBOL = require('../internals/native-symbol');

module.exports = function (name) {
  return store[name] || (store[name] = NATIVE_SYMBOL && Symbol[name]
    || (NATIVE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

},{"../internals/global":18,"../internals/native-symbol":31,"../internals/shared":50,"../internals/uid":57}],60:[function(require,module,exports){
'use strict';
var toIndexedObject = require('../internals/to-indexed-object');
var addToUnscopables = require('../internals/add-to-unscopables');
var Iterators = require('../internals/iterators');
var InternalStateModule = require('../internals/internal-state');
var defineIterator = require('../internals/define-iterator');
var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.github.io/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.github.io/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.github.io/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.github.io/ecma262/#sec-createarrayiterator
module.exports = defineIterator(Array, 'Array', function (iterated, kind) {
  setInternalState(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return { value: undefined, done: true };
  }
  if (kind == 'keys') return { value: index, done: false };
  if (kind == 'values') return { value: target[index], done: false };
  return { value: [index, target[index]], done: false };
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
Iterators.Arguments = Iterators.Array;

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"../internals/add-to-unscopables":2,"../internals/define-iterator":10,"../internals/internal-state":25,"../internals/iterators":30,"../internals/to-indexed-object":52}],61:[function(require,module,exports){
// `Symbol.prototype.description` getter
// https://tc39.github.io/ecma262/#sec-symbol.prototype.description
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var has = require('../internals/has');
var isObject = require('../internals/is-object');
var defineProperty = require('../internals/object-define-property').f;
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var NativeSymbol = require('../internals/global').Symbol;

if (DESCRIPTORS && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) ||
  // Safari 12 bug
  NativeSymbol().description !== undefined
)) {
  var EmptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
    var result = this instanceof SymbolWrapper
      ? new NativeSymbol(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };
  copyConstructorProperties(SymbolWrapper, NativeSymbol);
  var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
  symbolPrototype.constructor = SymbolWrapper;

  var symbolToString = symbolPrototype.toString;
  var native = String(NativeSymbol('test')) == 'Symbol(test)';
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  defineProperty(symbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = isObject(this) ? this.valueOf() : this;
      var string = symbolToString.call(symbol);
      if (has(EmptyStringDescriptionStore, symbol)) return '';
      var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  require('../internals/export')({ global: true, forced: true }, { Symbol: SymbolWrapper });
}

},{"../internals/copy-constructor-properties":6,"../internals/descriptors":11,"../internals/export":15,"../internals/global":18,"../internals/has":19,"../internals/is-object":27,"../internals/object-define-property":35}],62:[function(require,module,exports){
var DOMIterables = require('../internals/dom-iterables');
var ArrayIteratorMethods = require('../modules/es.array.iterator');
var global = require('../internals/global');
var hide = require('../internals/hide');
var wellKnownSymbol = require('../internals/well-known-symbol');
var ITERATOR = wellKnownSymbol('iterator');
var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var ArrayValues = ArrayIteratorMethods.values;

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
      hide(CollectionPrototype, ITERATOR, ArrayValues);
    } catch (e) {
      CollectionPrototype[ITERATOR] = ArrayValues;
    }
    if (!CollectionPrototype[TO_STRING_TAG]) hide(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
    if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
        hide(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
      } catch (e) {
        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
      }
    }
  }
}

},{"../internals/dom-iterables":13,"../internals/global":18,"../internals/hide":21,"../internals/well-known-symbol":59,"../modules/es.array.iterator":60}],63:[function(require,module,exports){
/*
 * Contains the Binding class.
 */
'use strict';
/**
 * A Binding associates a gesture with an element and a handler function that
 * will be called when the gesture is recognized.
 *
 * @param {Element} element - The element to which to associate the gesture.
 * @param {westures-core.Gesture} gesture - A instance of the Gesture type.
 * @param {Function} handler - The function handler to execute when a gesture
 *    is recognized on the associated element.
 */

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Binding {
  constructor(element, gesture, handler) {
    /**
     * The element to which to associate the gesture.
     *
     * @private
     * @type {Element}
     */
    this.element = element;
    /**
     * The gesture to associate with the given element.
     *
     * @private
     * @type {westures-core.Gesture}
     */

    this.gesture = gesture;
    /**
     * The function handler to execute when the gesture is recognized on the
     * associated element.
     *
     * @private
     * @type {Function}
     */

    this.handler = handler;
  }
  /**
   * Evalutes the given gesture hook, and dispatches any data that is produced.
   *
   * @private
   *
   * @param {string} hook - Must be one of 'start', 'move', 'end', or 'cancel'.
   * @param {State} state - The current State instance.
   */


  evaluateHook(hook, state) {
    const data = this.gesture[hook](state);

    if (data) {
      this.handler(_objectSpread({
        centroid: state.centroid,
        event: state.event,
        phase: hook,
        radius: state.radius,
        type: this.gesture.type,
        target: this.element
      }, data));
    }
  }

}

module.exports = Binding;

},{}],64:[function(require,module,exports){
/*
 * Contains the Gesture class
 */
'use strict';

let nextGestureNum = 0;
/**
 * The Gesture class that all gestures inherit from. A custom gesture class will
 * need to override some or all of the four phase "hooks": start, move, end, and
 * cancel.
 *
 * @memberof westures-core
 *
 * @param {string} type - The name of the gesture.
 */

class Gesture {
  constructor(type) {
    if (typeof type !== 'string') {
      throw new TypeError('Gestures require a string type / name');
    }
    /**
     * The name of the gesture. (e.g. 'pan' or 'tap' or 'pinch').
     *
     * @type {string}
     */


    this.type = type;
    /**
     * The unique identifier for each gesture. This allows for distinctions
     * across instances of Gestures that are created on the fly (e.g.
     * gesture-tap-1, gesture-tap-2).
     *
     * @type {string}
     */

    this.id = "gesture-".concat(this.type, "-").concat(nextGestureNum++);
  }
  /**
   * Event hook for the start phase of a gesture.
   *
   * @param {State} state - The input state object of the current region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */


  start() {
    return null;
  }
  /**
   * Event hook for the move phase of a gesture.
   *
   * @param {State} state - The input state object of the current region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */


  move() {
    return null;
  }
  /**
   * Event hook for the end phase of a gesture.
   *
   * @param {State} state - The input state object of the current region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */


  end() {
    return null;
  }
  /**
   * Event hook for when an input is cancelled.
   *
   * @param {State} state - The input state object of the current region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */


  cancel() {
    return null;
  }

}

module.exports = Gesture;

},{}],65:[function(require,module,exports){
/*
 * Contains the {@link Input} class
 */
'use strict';

require("core-js/modules/web.dom-collections.iterator");

const PointerData = require('./PointerData.js');
/**
 * In case event.composedPath() is not available.
 *
 * @private
 * @inner
 * @memberof Input
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
 * A WeakSet is used so that references will be garbage collected when the
 * element they point to is removed from the page.
 *
 * @private
 * @inner
 * @memberof Input
 * @return {WeakSet.<Element>} The Elements in the path of the given event.
 */


function getElementsInPath(event) {
  return new WeakSet(getPropagationPath(event));
}
/**
 * Tracks a single input and contains information about the current, previous,
 * and initial events. Contains the progress of each Input and its associated
 * gestures.
 *
 * @param {(PointerEvent | MouseEvent | TouchEvent)} event - The input event
 *    which will initialize this Input object.
 * @param {number} identifier - The identifier for this input, so that it can
 *    be located in subsequent Event objects.
 */


class Input {
  constructor(event, identifier) {
    const currentData = new PointerData(event, identifier);
    /**
     * The set of elements along the original event's propagation path at the
     * time it was dispatched.
     *
     * @private
     * @type {WeakSet.<Element>}
     */

    this.initialElements = getElementsInPath(event);
    /**
     * Holds the initial data from the mousedown / touchstart / pointerdown that
     * began this input.
     *
     * @type {PointerData}
     */

    this.initial = currentData;
    /**
     * Holds the most current pointer data for this Input.
     *
     * @type {PointerData}
     */

    this.current = currentData;
    /**
     * Holds the previous pointer data for this Input.
     *
     * @type {PointerData}
     */

    this.previous = currentData;
    /**
     * The identifier for the pointer / touch / mouse button associated with
     * this input.
     *
     * @type {number}
     */

    this.identifier = identifier;
    /**
     * Stores internal state between events for each gesture based off of the
     * gesture's id.
     *
     * @private
     * @type {Object}
     */

    this.progress = {};
  }
  /**
   * The phase of the input: 'start' or 'move' or 'end'
   *
   * @type {string}
   */


  get phase() {
    return this.current.type;
  }
  /**
   * The timestamp of the initiating event for this input.
   *
   * @type {number}
   */


  get startTime() {
    return this.initial.time;
  }
  /**
   * @private
   *
   * @param {string} id - The ID of the gesture whose progress is sought.
   *
   * @return {Object} The progress of the gesture.
   */


  getProgressOfGesture(id) {
    if (!this.progress[id]) {
      this.progress[id] = {};
    }

    return this.progress[id];
  }
  /**
   * @return {number} The distance between the initiating event for this input
   *    and its current event.
   */


  totalDistance() {
    return this.initial.distanceTo(this.current);
  }
  /**
   * Saves the given raw event in PointerData form as the current data for this
   * input, pushing the old current data into the previous slot, and tossing
   * out the old previous data.
   *
   * @private
   *
   * @param {Event} event - The event object to wrap with a PointerData.
   */


  update(event) {
    this.previous = this.current;
    this.current = new PointerData(event, this.identifier);
  }
  /**
   * Determines if this PointerData was inside the given element at the time it
   * was dispatched.
   *
   * @private
   *
   * @param {Element} element
   *
   * @return {boolean} true if the Input began inside the element, false
   *    otherwise.
   */


  wasInitiallyInside(element) {
    return this.initialElements.has(element);
  }

}

module.exports = Input;

},{"./PointerData.js":68,"core-js/modules/web.dom-collections.iterator":62}],66:[function(require,module,exports){
/*
 * Contains the PHASE object, which translates event names to phases
 * (a.k.a. hooks).
 */
'use strict';
/**
 * Normalizes window events to be either of type start, move, or end.
 *
 * @private
 * @enum {string}
 */

const PHASE = Object.freeze({
  mousedown: 'start',
  touchstart: 'start',
  pointerdown: 'start',
  mousemove: 'move',
  touchmove: 'move',
  pointermove: 'move',
  mouseup: 'end',
  touchend: 'end',
  pointerup: 'end',
  touchcancel: 'cancel',
  pointercancel: 'cancel'
});
module.exports = PHASE;

},{}],67:[function(require,module,exports){
/*
 * Contains the {@link Point2D} class.
 */
'use strict';
/**
 * The Point2D class stores and operates on 2-dimensional points, represented as
 * x and y coordinates.
 *
 * @memberof westures-core
 *
 * @param {number} [ x=0 ] - The x coordinate of the point.
 * @param {number} [ y=0 ] - The y coordinate of the point.
 */

class Point2D {
  constructor(x = 0, y = 0) {
    /**
     * The x coordinate of the point.
     *
     * @type {number}
     */
    this.x = x;
    /**
     * The y coordinate of the point.
     *
     * @type {number}
     */

    this.y = y;
  }
  /**
   * Calculates the angle between this point and the given point.
   *
   * @param {!westures-core.Point2D} point - Projected point for calculating the
   * angle.
   *
   * @return {number} Radians along the unit circle where the projected
   * point lies.
   */


  angleTo(point) {
    return Math.atan2(point.y - this.y, point.x - this.x);
  }
  /**
   * Determine the average distance from this point to the provided array of
   * points.
   *
   * @param {!westures-core.Point2D[]} points - the Point2D objects to calculate
   *    the average distance to.
   *
   * @return {number} The average distance from this point to the provided
   *    points.
   */


  averageDistanceTo(points) {
    return this.totalDistanceTo(points) / points.length;
  }
  /**
   * Clone this point.
   *
   * @return {westures-core.Point2D} A new Point2D, identical to this point.
   */


  clone() {
    return new Point2D(this.x, this.y);
  }
  /**
   * Calculates the distance between two points.
   *
   * @param {!westures-core.Point2D} point - Point to which the distance is
   * calculated.
   *
   * @return {number} The distance between the two points, a.k.a. the
   *    hypoteneuse.
   */


  distanceTo(point) {
    return Math.hypot(point.x - this.x, point.y - this.y);
  }
  /**
   * Subtract the given point from this point.
   *
   * @param {!westures-core.Point2D} point - Point to subtract from this point.
   *
   * @return {westures-core.Point2D} A new Point2D, which is the result of (this
   * - point).
   */


  minus(point) {
    return new Point2D(this.x - point.x, this.y - point.y);
  }
  /**
   * Return the summation of this point to the given point.
   *
   * @param {!westures-core.Point2D} point - Point to add to this point.
   *
   * @return {westures-core.Point2D} A new Point2D, which is the addition of the
   * two points.
   */


  plus(point) {
    return new Point2D(this.x + point.x, this.y + point.y);
  }
  /**
   * Calculates the total distance from this point to an array of points.
   *
   * @param {!westures-core.Point2D[]} points - The array of Point2D objects to
   *    calculate the total distance to.
   *
   * @return {number} The total distance from this point to the provided points.
   */


  totalDistanceTo(points) {
    return points.reduce((d, p) => d + this.distanceTo(p), 0);
  }
  /**
   * Calculates the centroid of a list of points.
   *
   * @param {westures-core.Point2D[]} points - The array of Point2D objects for
   * which to calculate the centroid.
   *
   * @return {westures-core.Point2D} The centroid of the provided points.
   */


  static centroid(points = []) {
    if (points.length === 0) return null;
    const total = Point2D.sum(points);
    return new Point2D(total.x / points.length, total.y / points.length);
  }
  /**
   * Calculates the sum of the given points.
   *
   * @param {westures-core.Point2D[]} points - The Point2D objects to sum up.
   *
   * @return {westures-core.Point2D} A new Point2D representing the sum of the
   * given points.
   */


  static sum(points = []) {
    return points.reduce((total, pt) => total.plus(pt), new Point2D(0, 0));
  }

}

module.exports = Point2D;

},{}],68:[function(require,module,exports){
/*
 * Contains the {@link PointerData} class
 */
'use strict';

const Point2D = require('./Point2D.js');

const PHASE = require('./PHASE.js');
/**
 * @private
 * @inner
 * @memberof PointerData
 *
 * @return {Event} The Event object which corresponds to the given identifier.
 *    Contains clientX, clientY values.
 */


function getEventObject(event, identifier) {
  if (event.changedTouches) {
    return Array.from(event.changedTouches).find(touch => {
      return touch.identifier === identifier;
    });
  }

  return event;
}
/**
 * Low-level storage of pointer data based on incoming data from an interaction
 * event.
 *
 * @param {Event} event - The event object being wrapped.
 * @param {number} identifier - The index of touch if applicable
 */


class PointerData {
  constructor(event, identifier) {
    /**
     * The original event object.
     *
     * @type {Event}
     */
    this.originalEvent = event;
    /**
     * The type or 'phase' of this batch of pointer data. 'start' or 'move' or
     * 'end'.
     *
     * @type {string}
     */

    this.type = PHASE[event.type];
    /**
     * The timestamp of the event in milliseconds elapsed since January 1, 1970,
     * 00:00:00 UTC.
     *
     * @type {number}
     */

    this.time = Date.now();
    const eventObj = getEventObject(event, identifier);
    /**
     * The (x,y) coordinate of the event, wrapped in a Point2D.
     *
     * @type {westures-core.Point2D}
     */
    // this.point = new Point2D(eventObj.pageX, eventObj.pageY);

    this.point = new Point2D(eventObj.clientX, eventObj.clientY);
  }
  /**
   * Calculates the angle between this event and the given event.
   *
   * @param {PointerData} pdata
   *
   * @return {number} Radians measurement between this event and the given
   *    event's points.
   */


  angleTo(pdata) {
    return this.point.angleTo(pdata.point);
  }
  /**
   * Calculates the distance between two PointerDatas.
   *
   * @param {PointerData} pdata
   *
   * @return {number} The distance between the two points, a.k.a. the
   *    hypoteneuse.
   */


  distanceTo(pdata) {
    return this.point.distanceTo(pdata.point);
  }

}

module.exports = PointerData;

},{"./PHASE.js":66,"./Point2D.js":67}],69:[function(require,module,exports){
/*
 * Contains the {@link Region} class
 */
'use strict';

const Binding = require('./Binding.js');

const State = require('./State.js');

const PHASE = require('./PHASE.js');

const POINTER_EVENTS = ['pointerdown', 'pointermove', 'pointerup'];
const MOUSE_EVENTS = ['mousedown', 'mousemove', 'mouseup'];
const TOUCH_EVENTS = ['touchstart', 'touchmove', 'touchend'];
const CANCEL_EVENTS = ['pointercancel', 'touchcancel'];
/**
 * Allows the user to specify the control region which will listen for user
 * input events.
 *
 * @memberof westures-core
 *
 * @param {Element} element - The element which should listen to input events.
 * @param {object} [options]
 * @param {boolean} [options.capture=false] - Whether the region uses the
 * capture phase of input events. If false, uses the bubbling phase.
 * @param {boolean} [options.preventDefault=true] - Whether the default
 * browser functionality should be disabled. This option should most likely be
 * ignored. Here there by dragons if set to false.
 * @param {string} [options.source='page'] - One of 'page', 'client', or
 * 'screen'. Determines what the source of (x,y) coordinates will be from the
 * input events. ('X' and 'Y' will be appended, then those are the properties
 * that will be looked up). *** NOT YET IMPLEMENTED ***
 */

class Region {
  // constructor(element, options = {}) {
  constructor(element, capture = false, preventDefault = true) {
    // const settings = { ...Region.DEFAULTS, ...options };

    /**
     * The list of relations between elements, their gestures, and the handlers.
     *
     * @private
     * @type {Binding[]}
     */
    this.bindings = [];
    /**
     * The list of active bindings for the current input session.
     *
     * @private
     * @type {Binding[]}
     */

    this.activeBindings = [];
    /**
     * Whether an input session is currently active.
     *
     * @private
     * @type {boolean}
     */

    this.isWaiting = true;
    /**
     * The element being bound to.
     *
     * @private
     * @type {Element}
     */

    this.element = element;
    /**
     * Whether the region listens for captures or bubbles.
     *
     * @private
     * @type {boolean}
     */

    this.capture = capture;
    /**
     * Whether the default browser functionality should be disabled. This option
     * should most likely be ignored. Here there by dragons if set to false.
     *
     * @private
     * @type {boolean}
     */

    this.preventDefault = preventDefault;
    /**
     * The internal state object for a Region.  Keeps track of inputs.
     *
     * @private
     * @type {State}
     */

    this.state = new State(this.element); // Begin operating immediately.

    this.activate();
  }
  /**
   * Activates the region by adding event listeners for all appropriate input
   * events to the region's element.
   *
   * @private
   */


  activate() {
    /*
     * Having to listen to both mouse and touch events is annoying, but
     * necessary due to conflicting standards and browser implementations.
     * Pointer is a fallback for now instead of the primary, until I figure out
     * all the details to do with pointer-events and touch-action and their
     * cross browser compatibility.
     *
     * Listening to both mouse and touch comes with the difficulty that
     * preventDefault() must be called to prevent both events from iterating
     * through the system. However I have left it as an option to the end user,
     * which defaults to calling preventDefault(), in case there's a use-case I
     * haven't considered or am not aware of.
     *
     * It is also a good idea to keep regions small in large pages.
     *
     * See:
     *  https://www.html5rocks.com/en/mobile/touchandmouse/
     *  https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
     *  https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
     */
    let eventNames = [];

    if (window.TouchEvent || window.MouseEvent) {
      eventNames = MOUSE_EVENTS.concat(TOUCH_EVENTS);
    } else {
      eventNames = POINTER_EVENTS;
    } // Bind detected browser events to the region element.


    const arbiter = this.arbitrate.bind(this);
    eventNames.forEach(eventName => {
      this.element.addEventListener(eventName, arbiter, {
        capture: this.capture,
        once: false,
        passive: false
      });
    });
    ['blur'].concat(CANCEL_EVENTS).forEach(eventname => {
      window.addEventListener(eventname, e => {
        e.preventDefault();
        this.state = new State(this.element);
        this.resetActiveBindings();
      });
    });
  }
  /**
   * Resets the active bindings.
   *
   * @private
   */


  resetActiveBindings() {
    this.activeBindings = [];
    this.isWaiting = true;
  }
  /**
   * Selects the bindings that are active for the current input sequence.
   *
   * @private
   */


  updateActiveBindings() {
    if (this.isWaiting && this.state.inputs.length > 0) {
      const input = this.state.inputs[0];
      this.activeBindings = this.bindings.filter(b => {
        return input.wasInitiallyInside(b.element);
      });
      this.isWaiting = false;
    }
  }
  /**
   * Evaluates whether the current input session has completed.
   *
   * @private
   */


  pruneActiveBindings() {
    if (this.state.hasNoActiveInputs()) {
      this.resetActiveBindings();
    }
  }
  /**
   * All input events flow through this function. It makes sure that the input
   * state is maintained, determines which bindings to analyze based on the
   * initial position of the inputs, calls the relevant gesture hooks, and
   * dispatches gesture data.
   *
   * @private
   * @param {Event} event - The event emitted from the window object.
   */


  arbitrate(event) {
    this.state.updateAllInputs(event);
    this.updateActiveBindings();

    if (this.activeBindings.length > 0) {
      if (this.preventDefault) event.preventDefault();
      this.activeBindings.forEach(binding => {
        binding.evaluateHook(PHASE[event.type], this.state);
      });
    }

    this.state.clearEndedInputs();
    this.pruneActiveBindings();
  }
  /**
   * Bind an element to a gesture with an associated handler.
   *
   * @param {Element} element - The element object.
   * @param {westures-core.Gesture} gesture - Gesture type with which to bind.
   * @param {Function} handler - The function to execute when a gesture is
   *    recognized.
   */


  addGesture(element, gesture, handler) {
    this.bindings.push(new Binding(element, gesture, handler));
  }
  /**
   * Retrieves Bindings by their associated element.
   *
   * @private
   *
   * @param {Element} element - The element for which to find bindings.
   *
   * @return {Binding[]} Bindings to which the element is bound.
   */


  getBindingsByElement(element) {
    return this.bindings.filter(b => b.element === element);
  }
  /**
   * Unbinds an element from either the specified gesture or all if no gesture
   * is specified.
   *
   * @param {Element} element - The element to unbind.
   * @param {westures-core.Gesture} [ gesture ] - The gesture to unbind. If
   * undefined, will unbind all Bindings associated with the given element.
   */


  removeGestures(element, gesture) {
    this.getBindingsByElement(element).forEach(b => {
      if (gesture == null || b.gesture === gesture) {
        this.bindings.splice(this.bindings.indexOf(b), 1);
      }
    });
  }

}

Region.DEFAULTS = Object.freeze({
  capture: false,
  preventDefault: true
});
module.exports = Region;

},{"./Binding.js":63,"./PHASE.js":66,"./State.js":71}],70:[function(require,module,exports){
/*
 * Contains the abstract Pinch class.
 */
'use strict';

require("core-js/modules/es.symbol.description");

const cascade = Symbol('cascade');
const smooth = Symbol('smooth');
/**
 * Determines whether to apply smoothing. Smoothing is on by default but turned
 * off if either:
 *  1. The user explicitly requests that it be turned off.
 *  2. The active poiner is not "coarse".
 *
 * @see {@link
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia}
 *
 * @private
 * @inner
 * @memberof westures-core.Smoothable
 *
 * @param {boolean} isRequested - Whether smoothing was requested by the user.
 *
 * @returns {boolean} Whether to apply smoothing.
 */

function smoothingIsApplicable(isRequested = true) {
  if (isRequested) {
    try {
      return window.matchMedia('(pointer: coarse)').matches;
    } catch (e) {
      return true;
    }
  }

  return false;
}
/**
 * A Smoothable gesture is one that emits on 'move' events. It provides a
 * 'smoothing' option through its constructor, and will apply smoothing before
 * emitting. There will be a tiny, ~1/60th of a second delay to emits, as well
 * as a slight amount of drift over gestures sustained for a long period of
 * time.
 *
 * For a gesture to make use of smoothing, it must return `this.smooth(data,
 * field)` from the `move` phase, instead of returning the data directly. If the
 * data being smoothed is not a simple number, it must also override the
 * `smoothingAverage(a, b)` method. Also you will probably want to call
 * `super.restart()` at some point in the `start`, `end`, and `cancel` phases.
 *
 * @memberof westures-core
 * @mixin
 *
 * @param {string} name - The name of the gesture.
 * @param {Object} [options]
 * @param {boolean} [options.smoothing=true] Whether to apply smoothing to
 * emitted data.
 */


const Smoothable = superclass => class Smoothable extends superclass {
  constructor(name, options = {}) {
    super(name, options);
    /**
     * The function through which smoothed emits are passed.
     *
     * @memberof westures-core.Smoothable
     *
     * @type {function}
     * @param {object} data - The data to emit.
     */

    this.smooth = null;

    if (smoothingIsApplicable(options.smoothing)) {
      this.smooth = this[smooth].bind(this);
    } else {
      this.smooth = data => data;
    }
    /**
     * The "identity" value of the data that will be smoothed.
     *
     * @memberof westures-core.Smoothable
     *
     * @type {*}
     * @default 0
     */


    this.identity = 0;
    /**
     * Stage the emitted data once.
     *
     * @private
     * @static
     * @memberof westures-core.Smoothable
     *
     * @alias [@@cascade]
     * @type {object}
     */

    this[cascade] = this.identity;
  }
  /**
   * Restart the Smoothable gesture.
   *
   * @memberof westures-core.Smoothable
   */


  restart() {
    this[cascade] = this.identity;
  }
  /**
   * Smooth out the outgoing data.
   *
   * @private
   * @memberof westures-core.Smoothable
   *
   * @param {object} next - The next batch of data to emit.
   * @param {string} field - The field to which smoothing should be applied.
   *
   * @return {?object}
   */


  [smooth](next, field) {
    const avg = this.smoothingAverage(this[cascade], next[field]);
    this[cascade] = avg;
    next[field] = avg;
    return next;
  }
  /**
   * Average out two values, as part of the smoothing algorithm.
   *
   * @private
   * @memberof westures-core.Smoothable
   *
   * @param {number} a
   * @param {number} b
   *
   * @return {number} The average of 'a' and 'b'
   */


  smoothingAverage(a, b) {
    return (a + b) / 2;
  }

};

module.exports = Smoothable;

},{"core-js/modules/es.symbol.description":61}],71:[function(require,module,exports){
/*
 * Contains the {@link State} class
 */
'use strict';

require("core-js/modules/es.symbol.description");

require("core-js/modules/web.dom-collections.iterator");

const Input = require('./Input.js');

const PHASE = require('./PHASE.js');

const Point2D = require('./Point2D.js');

const symbols = Object.freeze({
  inputs: Symbol.for('inputs')
});
/**
 * Set of helper functions for updating inputs based on type of input.
 * Must be called with a bound 'this', via bind(), or call(), or apply().
 *
 * @private
 * @inner
 * @memberof State
 */

const update_fns = {
  TouchEvent: function TouchEvent(event) {
    Array.from(event.changedTouches).forEach(touch => {
      this.updateInput(event, touch.identifier);
    });
  },
  PointerEvent: function PointerEvent(event) {
    this.updateInput(event, event.pointerId);
  },
  MouseEvent: function MouseEvent(event) {
    if (event.button === 0) {
      this.updateInput(event, event.button);
    }
  }
};
/**
 * Keeps track of currently active and ending input points on the interactive
 * surface.
 *
 * @param {Element} element - The element underpinning the associated Region.
 */

class State {
  constructor(element) {
    /**
     * Keep a reference to the element for the associated region.
     *
     * @private
     * @type {Element}
     */
    this.element = element;
    /**
     * Keeps track of the current Input objects.
     *
     * @private
     * @alias [@@inputs]
     * @type {Map.<Input>}
     * @memberof State
     */

    this[symbols.inputs] = new Map();
    /**
     * All currently valid inputs, including those that have ended.
     *
     * @type {Input[]}
     */

    this.inputs = [];
    /**
     * The array of currently active inputs, sourced from the current Input
     * objects. "Active" is defined as not being in the 'end' phase.
     *
     * @type {Input[]}
     */

    this.active = [];
    /**
     * The array of latest point data for the currently active inputs, sourced
     * from this.active.
     *
     * @type {westures-core.Point2D[]}
     */

    this.activePoints = [];
    /**
     * The centroid of the currently active points.
     *
     * @type {westures-core.Point2D}
     */

    this.centroid = {};
    /**
     * The latest event that the state processed.
     *
     * @type {Event}
     */

    this.event = null;
  }
  /**
   * Deletes all inputs that are in the 'end' phase.
   *
   * @private
   */


  clearEndedInputs() {
    this[symbols.inputs].forEach((v, k) => {
      if (v.phase === 'end') this[symbols.inputs].delete(k);
    });
  }
  /**
   * @param {string} phase - One of 'start', 'move', or 'end'.
   *
   * @return {Input[]} Inputs in the given phase.
   */


  getInputsInPhase(phase) {
    return this.inputs.filter(i => i.phase === phase);
  }
  /**
   * @param {string} phase - One of 'start', 'move', or 'end'.
   *
   * @return {Input[]} Inputs <b>not</b> in the given phase.
   */


  getInputsNotInPhase(phase) {
    return this.inputs.filter(i => i.phase !== phase);
  }
  /**
   * @private
   * @return {boolean} True if there are no active inputs. False otherwise.
   */


  hasNoActiveInputs() {
    return this[symbols.inputs].size === 0;
  }
  /**
   * Update the input with the given identifier using the given event.
   *
   * @private
   *
   * @param {Event} event - The event being captured.
   * @param {number} identifier - The identifier of the input to update.
   */


  updateInput(event, identifier) {
    switch (PHASE[event.type]) {
      case 'start':
        this[symbols.inputs].set(identifier, new Input(event, identifier));

        try {
          this.element.setPointerCapture(identifier);
        } catch (e) {// NOP: Optional operation failed.
        }

        break;

      case 'end':
        try {
          this.element.releasePointerCapture(identifier);
        } catch (e) {} // NOP: Optional operation failed.
        // All of 'end', 'move', and 'cancel' perform updates, hence the
        // following fall-throughs


      case 'move':
      case 'cancel':
        if (this[symbols.inputs].has(identifier)) {
          this[symbols.inputs].get(identifier).update(event);
        }

        break;

      default:
        console.warn("Unrecognized event type: ".concat(event.type));
    }
  }
  /**
   * Updates the inputs with new information based upon a new event being fired.
   *
   * @private
   * @param {Event} event - The event being captured.
   */


  updateAllInputs(event) {
    update_fns[event.constructor.name].call(this, event);
    this.updateFields(event);
  }
  /**
   * Updates the convenience fields.
   *
   * @private
   * @param {Event} event - Event with which to update the convenience fields.
   */


  updateFields(event = null) {
    this.inputs = Array.from(this[symbols.inputs].values());
    this.active = this.getInputsNotInPhase('end');
    this.activePoints = this.active.map(i => i.current.point);
    this.centroid = Point2D.centroid(this.activePoints); // XXX: Delete this.radius for next released. It is not generally useful.

    this.radius = this.activePoints.reduce((acc, cur) => {
      const dist = cur.distanceTo(this.centroid);
      return dist > acc ? dist : acc;
    }, 0);
    if (event) this.event = event;
  }

}

module.exports = State;

},{"./Input.js":65,"./PHASE.js":66,"./Point2D.js":67,"core-js/modules/es.symbol.description":61,"core-js/modules/web.dom-collections.iterator":62}]},{},[1])(1)
});