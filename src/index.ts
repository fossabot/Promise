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
  then: () => any
}

type PromiseStateType = 'pending' | 'fulfilled' | 'rejected'
type PromiseCallbackType = () => any
type PromiseCallbackListType = PromiseCallbackType[]

function nextTick(cb, args, context) {
  if (process) {
    process.nextTick(() => cb.apply(context, args))
  } else if (setImmediate) {
    setImmediate(() => cb.apply(context, args))
  } else {
    setTimeout(() => cb.apply(context, args), 0)
  }
}

export default class Promise {
  // 存储结果值
  private value: any
  // 成功回调事件
  private fulfilledCbs: PromiseCallbackListType = []
  // 失败回调事件
  private rejectedCbs: PromiseCallbackListType = []
  // 当前 Promise 状态
  private state: PromiseStateType = 'pending'

  /**
   * Promise then 方法
   *
   * @param resolve
   * @param reject
   */
  public then(resolve, reject) {
    if (typeof resolve === 'function') {
      this.fulfilledCbs.push(resolve)
    }

    if (typeof reject === 'function') {
      this.rejectedCbs.push(reject)
    }

    if (this.state === 'fulfilled') {
      // fulfilled
      this._resolve()
    }

    if (this.state === 'rejected') {
      // rejected
      this._reject()
    }
  }

  private _resolve() {
    for (let i = 0, len = this.fulfilledCbs.length; i < len; i++) {
      nextTick(this.fulfilledCbs[i], [this.value], {})
    }

    this.fulfilledCbs = []
    this.rejectedCbs = []
  }

  private _reject() {
    for (let i = 0, len = this.rejectedCbs.length; i < len; i++) {
      nextTick(this.rejectedCbs[i], [this.value], {})
    }

    this.fulfilledCbs = []
    this.rejectedCbs = []
  }
}
