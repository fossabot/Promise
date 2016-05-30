/**
 * promise-elixir
 *
 * Copyright © 2016 blackcater. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import Promise from './Promise';

/**
 *
 * @param type
 * @returns {function()}
 */
function isType(type) {

  let tmp = type;

  return (obj) => {
    return (Object.prototype.toString.call(obj) === "[object "+tmp+"]") && obj;
  };
}
/**
 *
 * @type {function()}
 */
export var isFunc = isType("Function");

/**
 *
 * @param value
 * @returns {boolean|Promise}
 */
export function isPromise(value) {
  return (value instanceof Promise && value);
}

/**
 *
 * @param value
 * @returns {*|Promise.then|then}
 */
export function isThenable(value) {
  return value && value.then && isFunc(value.then);
}

/**
 *
 * @param fn
 * @returns {function()}
 */
function once(fn) {
  let called = null;
  let result;

  return (...args) => {
    if (called) return result;
    called = true;
    const arr = [...args];
    result = fn.apply(this, arr);
    return this;
  };
}

/**
 *
 * @param promise
 * @param x
 * @returns {*|string|Promise.<*>|String|{filePath}|{filePath, configName}}
 */
export function resolveX(promise, x) {
  if (x === promise) promise.reject(new Error('TypeError'));

  if (isPromise(x)) {
    return resolvePromise(promise, x);
  } else if (isThenable(x)) {
    return resolveThenable(promise, x);
  } else {
    return promise.resolve(x);
  }
}

/**
 *
 * @param promise1
 * @param promise2
 * @returns {*}
 */
export function resolvePromise(promise1, promise2) {
  const state = promise2.state;

  if (state === 'Pending') {
    return promise2.then(promise1.resolve.bind(promise1), promise1.reject.bind(promise1));
  }

  if (state === 'Fulfilled') {
    return promise1.resolve(promise2.value);
  }

  if (state === 'Rejected') {
    return promise1.reject(promise2.value);
  }
}

/**
 *
 * @param promise
 * @param thenable
 * @returns {*}
 */
export function resolveThenable(promise, thenable) {
  let called = null;

  const resolve = once(r => {
    if (called) return;
    resolveX(promise, r);
    called = true;
  });

  const reject = once(x => {
    if (called) return;
    promise.reject(x);
    called = true;
  });

  try {
    thenable.then.call(thenable, resolve, reject);
  } catch (err) {
    promise.reject(err);
  }

  return promise;
}

/**
 *
 * @param promise
 */
export function doPromise(promise) {
  const state = promise.state;
  const queue = promise[(state === 'Fulfilled') ? 'resolves' : 'rejects'];
  const value = promise.value;

  let fn = null;
  let x = null;

  while (fn = queue.shift()) {
    try {
      x = fn.call(promise, value);
      if (x) {
        resolveX(promise.next, x);
      }
    } catch (err) {
      promise.next.reject(err);
    }
  }
}

/**
 *
 * @param args
 * @param fn
 */
export function each(args, fn) {
  if (args instanceof Object) {
    for(let key in args) {
      fn(args[key], key, args);
    }
  }
}
