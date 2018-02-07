/*
 * Copyright (c) 2018.
 *
 * Promise简单实现, 符合Promimse/A+
 *
 * @project: blackcater/Promise<https://github.com/blackcater/Promise>
 * @author: blackcater<blackcater2015@gmail.com>
 */

// thenable
interface IPromiseThenable {
  then: (a: (x: any) => any, b: (y: any) => any) => void
}

type PromiseStateType = 'pending' | 'fulfilled' | 'rejected'
type PromiseCallbackType = (value: any) => any
type PromiseCallbackListType = PromiseCallbackType[]

function nextTick(cb) {
  if (!cb) return

  if (setImmediate) {
    setImmediate(cb)
  } else {
    setTimeout(cb, 0)
  }
}

export default class Promise {
  /**
   * 快速创建一个 promise 是实例，且 state 为 fulfilled
   *
   * 使用：
   *    > Promise.resolve(1)
   *    > Promise.resolve(<promise>)
   *    > Promise.resolve(<thenable>)
   */
  public static resolve(value): Promise {
    return new Promise(resolve => {
      resolve(value)
    })
  }

  /**
   * 快速创建一个 promise 实例，且 state 为 rejected
   *
   * 使用：
   *    > Promise.resolve(1)
   *    > Promise.resolve(<any>)
   */
  public static reject(value): Promise {
    return new Promise((resolve, reject) => {
      reject(value)
    })
  }

  public static all(promises: any[]): Promise {
    return new Promise((resolve, reject) => {
      const states = new Array(promises.length)
      const values = new Array(promises.length)

      for (let i = 0, len = promises.length; i < len; i++) {
        const promise = promises[i]

        if (promise instanceof Promise) {
          promise.then(x => {
            values[i] = x
            states[i] = true

            if (states.every(y => !!y)) {
              resolve(values)
            }
          }, reject)
        } else {
          values[i] = promise
          states[i] = true
        }
      }

      if (states.every(y => !!y)) {
        resolve(values)
      }
    })
  }

  public static race(promises: any[]): Promise {
    return new Promise((resolve, reject) => {
      let state = false
      let value

      for (let i = 0, len = promises.length; i < len; i++) {
        const promise = promises[i]

        if (promise instanceof Promise) {
          promise.then(x => {
            if (state) return

            state = true
            value = x

            resolve(value)
          }, reject)
        } else {
          if (state) return

          state = true
          value = promise

          resolve(promise)
        }
      }
    })
  }

  // 存储成功结果值
  public value: any
  // 存储下一个 promise
  public nextPromise: Promise
  // 成功回调事件
  public fulfilledCbs: PromiseCallbackListType = []
  // 失败回调事件
  public rejectedCbs: PromiseCallbackListType = []
  // 当前 Promise 状态
  public state: PromiseStateType = 'pending'

  public constructor(resolver?) {
    if (resolver && typeof resolver !== 'function')
      throw new Error(`Promise resolver ${resolver} is not a function`)

    if (resolver) resolver(this._resolve, this._reject)
  }

  /**
   * Promise then 方法
   *
   * @param resolve
   * @param reject
   */
  public then(resolve, reject): Promise {
    this.nextPromise = this.nextPromise || new Promise()

    if (typeof resolve === 'function') {
      this.fulfilledCbs.push(resolve)
    }

    if (typeof reject === 'function') {
      this.rejectedCbs.push(reject)
    }

    if (this.state === 'fulfilled') {
      // fulfilled'
      this._callbacks()
    }

    if (this.state === 'rejected') {
      // rejected
      this._callbacks()
    }

    return this.nextPromise
  }

  public _resolve(value) {
    if (this.state !== 'pending') return

    this.state = 'fulfilled'
    this.value = value

    this._callbacks()
  }

  public _reject(value) {
    if (this.state !== 'pending') return

    this.state = 'rejected'
    this.value = value

    this._callbacks()
  }

  private _procedure(promise: Promise, x: any) {
    if (promise === x) {
      return promise._reject(new TypeError('promise and value cannot be same'))
    }

    if (x instanceof Promise) {
      return this._procedurePromise(promise, x)
    }

    if (x.then) {
      return this._procedureThenable(promise, x)
    }

    return promise._resolve(x)
  }

  private _procedurePromise(promise: Promise, x: Promise) {
    if (x.state === 'fulfilled') {
      promise._resolve(x.value)
    }

    if (x.state === 'rejected') {
      promise._reject(x.value)
    }

    x.then(promise._resolve.bind(promise), promise._reject.bind(promise))
  }

  private _procedureThenable(promise: Promise, x: IPromiseThenable) {
    let called = false
    const resolve = y => {
      if (called) return

      this._procedure(promise, y)
      called = true
    }
    const reject = e => {
      if (called) return

      promise._reject(e)
      called = true
    }

    try {
      x.then(resolve, reject)
    } catch (e) {
      promise._reject(e)
    }
  }

  private _callbacks() {
    const queue =
      this.state === 'fulfilled' ? this.fulfilledCbs : this.rejectedCbs

    if (!queue.length) return

    for (let i = 0, len = queue.length; i < len; i++) {
      nextTick(() => {
        try {
          const x =
            typeof queue === 'function' ? queue[i](this.value) : this.value

          this._procedure(this.nextPromise, x)
        } catch (e) {
          this.nextPromise._reject(e)
        }
      })
    }
  }
}
