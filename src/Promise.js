/**
 * promise-elixir
 *
 * Copyright © 2016 blackcater. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import { isFunc, resolveX, doPromise } from './util';

class Promise {
  constructor(value) {
    /**
     * The state of current promise object.
     * There can have three kinds of state.
     * Pending - Fulfilled - Rejected
     * @type {string} The state of current promise object
     * @private
     */
    this.state = 'Pending';
    /**
     * It store the value of the promise object.
     * It can store both rejected value and fulfilled value.
     * @type {null} the value of the promise object
     * @private
     */
    this.value = null;
    /**
     * It is used to save the next promise object
     * @type {null} the object is a instance of promise object
     * @private
     */
    this.next = null;
    /**
     * It store the functions of the promise process.
     * It can store fulfilled function.
     * @type {Array} the functions of the promise process.
     * @private
     */
    this.resolves = [];
    /**
     * It store the functions of the promise process.
     * It can store rejected function.
     * @type {Array} the functions of the promise process.
     * @private
     */
    this.rejects = [];

    // bind functions to func argument.
    if (isFunc(value) && value) {
      // It may occur some error. We need to catch them
      try {
        value(this.resolve.bind(this), this.reject.bind(this));
      } catch (err) {
        this.reject(err);
      }
    }

    return this;
  }

  /**
   * Using this functon to change state(pending) to state(fulfilled)
   * @param value
   * @private
   */
  resolve(value) {
    if (this.state === 'Rejected') throw new Error('Illegal call');

    // change the state, save the value
    this.state = 'Fulfilled';
    this.value = value;

    if (this.resolves.length) {
      doPromise(this);
    }

    return this;
  }

  /**
   * Using this functon to change state(pending) to state(rejected)
   * @param value
   * @private
   */
  reject(value) {
    if (this.state === 'Fulfilled') throw new Error('Illegal call');

    // change the state
    this.state = 'Rejected';
    this.value = value;

    if (this.rejects.length) {
      doPromise(this);
    }

    return this;
  }

  /**
   *
   * @param onFulfilled
   * @param onRejected
   * @return{Promise} return a new promise object
   */
  then(onFulfilled, onRejected) {
    const nextPromise = this.next = new Promise();
    let x = null;

    if (this.state === 'Pending') {
      if (isFunc(onFulfilled)) {
        this.resolves.push(onFulfilled);
      }

      if (isFunc(onRejected)) {
        this.rejects.push(onRejected);
      }
      return nextPromise;
    }


    if (this.state === 'Fulfilled') {
      if (!isFunc(onFulfilled)) {
        nextPromise.resolve(onFulfilled);
      } else {
        try {
          x = onFulfilled(this.value);
          x && resolveX(nextPromise, x);
        } catch (err) {
          nextPromise.reject(err);
        }
      }
      return nextPromise;
    }

    if (this.state === 'Rejected') {
      if (!isFunc(onRejected)) {
        nextPromise.reject(onRejected);
      } else {
        try {
          x = onRejected(this.value);
          x && resolveX(nextPromise, x);
        } catch (err) {
          nextPromise.reject(err);
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
