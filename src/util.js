/**
 * promise-elixir
 *
 * Copyright © 2016 blackcater. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import Promise from './Promise';

export function isFunc(value) {
  return (typeof value === "function" && value);
}

export function isPromise(value) {
  return (value instanceof Promise && value);
}

export function isThenable(value) {
  return value && value.then && isFunc(value.then);
}

export function doPromise(promise) {
  let state = promise._state;
  let queue = promise["Fulfilled" === state ? "_resolved": "_rejects"];
  let value = promise._value;

  let fn = null;
  let x = null;

  while(fn = queue.shift()) {
    try {
      x = fn.call(promise, value);
      x && resolveX(promise._next, x);
    } catch (err) {
       promise._next._reject(err);
    }
  }

  return promise;
}

export function resolveX(promise, x) {
  if (x === promise) promise._reject(new Error('TypeError'));

  if (isPromise(x)) {
    return resolvePromise(promise, x);
  } else if (isThenable(x)) {
    return resolveThenable(promise, x);
  } else {
    return promise._resolve(x);
  }
}

function resolvePromise(promise1, promise2) {
  var state = promise2._state;

  if (state === "Pending") {
    return promise2.then(promise1._resolve.bind(promise1), promise1._reject.bind(promise1))
  }

  if (state === "Fulfilled") {
    return promise1._resolve(promise2._value);
  }

  if (state === "Rejected") {
    return promise1._reject(promise2._value);
  }
}

function resolveThenable(promise, thenable) {
  let called = null;

  let resolve = once(function (r) {
    if (called) return ;
    resolveX(promise, r);
    called = true;
  });

  let reject = once(function (x) {
    if (called) return ;
    promise._reject(x);
    called = true;
  });

  try {
    thenable.then.call(thenable, resolve, reject);
  } catch (err) {
    promise._reject(err);
  }

  return promise;
}

function once(fn) {
  let called = null;
  let result;

  return function () {
    if (called) return result;
    called = true;
    result = fn.apply(this, arguments);
  }
}

