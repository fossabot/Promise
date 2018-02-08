/*
 * Copyright (c) 2018.
 *
 * Promise简单实现, 符合Promimse/A+
 *
 * @project: blackcater/Promise<https://github.com/blackcater/Promise>
 * @author: blackcater<blackcater2015@gmail.com>
 */

// thenable
export interface IPromiseThenable {
  then: (a: (x: any) => any, b: (y: any) => any) => void
}

export interface IPromiseNextObject {
  resolve: PromiseCallbackType
  reject: PromiseCallbackType
  promise: Promise
}

export type PromiseStateType = 'pending' | 'fulfilled' | 'rejected'
export type PromiseCallbackType = (value: any) => any

function isPromise(x) {
  return x instanceof Promise
}

function isThenable(x) {
  return x && x.then && typeof x.then === 'function'
}

// 异步调用方法 cb
function nextTick(cb) {
  if (!cb) return

  if (setImmediate) {
    setImmediate(cb)
  } else {
    setTimeout(cb, 0)
  }
}

function createArray(num = 0, init?) {
  const arr = []

  for (let i = 0; i < num; i++) {
    arr.push(init)
  }

  return arr
}

// 处理 下一个 promise
function procedure(promise: Promise, x: any) {
  if (promise === x) {
    return promise._reject(new TypeError('promise and value cannot be same'))
  }

  if (isPromise(x)) {
    return procedurePromise(promise, x)
  }

  if (isThenable(x)) {
    return procedureThenable(promise, x)
  }

  return promise._resolve(x)
}

// 处理 promise 类型值
function procedurePromise(promise: Promise, x: Promise) {
  if (x.state === 'fulfilled') {
    promise._resolve(x.value)
  }

  if (x.state === 'rejected') {
    promise._reject(x.value)
  }

  x.then(promise._resolve.bind(promise), promise._reject.bind(promise))
}

// 处理 thenable 类型值
function procedureThenable(promise: Promise, x: IPromiseThenable) {
  let called = false

  const resolve = y => {
    if (called) return

    procedure(promise, y)
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
    const promise = new Promise()

    procedure(promise, value)

    return promise
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

  public static all(list: any[]): Promise {
    return new Promise((resolve, reject) => {
      const states = createArray(list.length, false)
      const values = createArray(list.length, undefined)

      for (let i = 0, len = list.length; i < len; i++) {
        const item = list[i]
        const promise = new Promise()

        procedure(promise, item)

        promise.then(x => {
          values[i] = x
          states[i] = true

          if (states.every(y => !!y)) {
            resolve(values)
          }
        }, reject)
      }
    })
  }

  public static race(list: any[]): Promise {
    return new Promise((resolve, reject) => {
      let state = false
      let value

      for (let i = 0, len = list.length; i < len; i++) {
        const item = list[i]
        const promise = new Promise()

        procedure(promise, item)

        promise.then(x => {
          if (state) return

          state = true
          value = x

          resolve(value)
        }, reject)
      }
    })
  }

  // 存储成功结果值
  public value: any
  // 当前 Promise 状态
  public state: PromiseStateType = 'pending'
  // 存储 then 回调
  private next: IPromiseNextObject[] = []

  // FIXME: 有些许不规范，resolver 真实是必需传入项
  public constructor(resolver?) {
    if (resolver && typeof resolver !== 'function')
      throw new Error(`Promise resolver ${resolver} is not a function`)

    if (resolver) resolver(this._resolve.bind(this), this._reject.bind(this))
  }

  /**
   * Promise then 方法
   *
   * @param resolve
   * @param reject
   */
  public then(resolve?, reject?): Promise {
    const nextPromise = new Promise()

    if (this.state === 'pending') {
      this.next.push({
        resolve,
        reject,
        promise: nextPromise,
      })

      return nextPromise
    }

    if (this.state === 'fulfilled') {
      // fulfilled'
      if (typeof resolve === 'function') {
        nextTick(() => {
          try {
            const x = resolve(this.value)

            procedure(nextPromise, x)
          } catch (e) {
            nextPromise._reject(e)
          }
        })
      } else {
        nextPromise._resolve(this.value)
      }

      return nextPromise
    }

    if (this.state === 'rejected') {
      // rejected
      if (typeof reject === 'function') {
        nextTick(() => {
          try {
            const x = reject(this.value)

            procedure(nextPromise, x)
          } catch (e) {
            nextPromise._reject(e)
          }
        })
      } else {
        nextPromise._reject(this.value)
      }

      return nextPromise
    }

    return nextPromise
  }

  public catch(reject): Promise {
    return this.then(void 0, reject)
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

  private _callbacks() {
    if (!this.next.length) return

    for (let i = 0, len = this.next.length; i < len; i++) {
      const { resolve, reject, promise } = this.next[i]
      const cb = this.state === 'fulfilled' ? resolve : reject

      nextTick(() => {
        try {
          const x = typeof cb === 'function' ? cb(this.value) : this.value

          procedure(promise, x)
        } catch (e) {
          promise._reject(e)
        }
      })
    }
  }
}
