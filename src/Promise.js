/**
 * promise-elixir
 *
 * Copyright © 2016 blackcater. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import { isFunc, isPromise, resolveX, doPromise } from './util';

class Promise {
  constructor(value) {
    // If it not the instance of Promise, we will return a new promise object
    if (!(this instanceof Promise)) return new Promise(value);

    /**
     * The state of current promise object.
     * There can have three kinds of state.
     * Pending - Fulfilled - Rejected
     * @type {string} The state of current promise object
     * @private
     */
    this._state = "Pending";
    /**
     * It store the value of the promise object.
     * It can store both rejected value and fulfilled value.
     * @type {null} the value of the promise object
     * @private
     */
    this._value = null;
    /**
     * It is used to save the next promise object
     * @type {null} the object is a instance of promise object
     * @private
     */
    this._next = null;
    /**
     * It store the functions of the promise process.
     * It can store fulfilled function.
     * @type {Array} the functions of the promise process.
     * @private
     */
    this._resolves = [];
    /**
     * It store the functions of the promise process.
     * It can store rejected function.
     * @type {Array} the functions of the promise process.
     * @private
     */
    this._rejects = [];

    // bind functions to func argument.
    if (isFunc(value) && value) {
      // It may occur some error. We need to catch them
      try {
        value(this._resolve.bind(this), this._reject.bind(this));
      } catch(err) {
        this._reject(err);
      }
    }
  }

  /**
   * Using this functon to change state(pending) to state(fulfilled)
   * @param value
   * @private
   */
  _resolve(value) {
    if (this._state === "Rejected") throw new Error("Illegal call");

    // change the state, save the value
    this._state = "Fulfilled";
    this._value = value;

    this._resolves.length && doPromise(this);

    return this;
  }

  /**
   * Using this functon to change state(pending) to state(rejected)
   * @param value
   * @private
   */
  _reject(value) {
    if (this._state === "Fulfilled") throw new Error("Illegal call");

    // change the state
    this._state = "Rejected";
    this._value = value;

    this._rejects.length && doPromise(this);

    return this;
  }

  /**
   *
   * @param onFulfilled
   * @param onRejected
   * @return{Promise} return a new promise object
   */
  then(onFulfilled, onRejected) {

    let nextPromise = this._next || (this._next = new Promise());
    let x = null;

    if (this._state === "Pending") {
      isFunc(onFulfilled) && this._resolves.push(onFulfilled);
      isFunc(onRejected) && this._rejects.push(onRejected);
      // nextPromise._resolves = this._resolves;
      // nextPromise._rejects = this._rejects;
      return nextPromise;
    }


    if (this._state === "Fulfilled") {
      if (!isFunc(onFulfilled)) {
        nextPromise._resolve(onFulfilled);
      } else {
        try {
          x = onFulfilled(this._value);
          resolveX(nextPromise, x);
        } catch (err) {
          nextPromise._reject(err);
        }
      }

      return nextPromise;
    }

    if (this._state === "Rejected") {
      if(!isFunc(onRejected)) {
        nextPromise._reject(onRejected);
      } else {
        try {
          x = onRejected(this._value);
          resolveX(nextPromise, x);
        } catch (err) {
          nextPromise._reject(err);
        }
      }

      return nextPromise;
    }

  }

  /**
   *
   * @param onRejected
   * @return{Promise} return a new promise object
   */
  catch(onRejected) {

  }
}

Promise.resolve = () => {

};


Promise.reject = () => {

};


Promise.all = () => {

};

Promise.race = () => {

};

export default Promise;
