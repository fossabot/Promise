/*
 * Copyright (c) 2018.
 *
 * Promise简单实现, 符合Promimse/A+
 *
 * @project: blackcater/Promise<https://github.com/blackcater/Promise>
 * @author: blackcater<blackcater2015@gmail.com>
 */
function isPromise(x) {
    return x instanceof Promise$1;
}
function isThenable(x) {
    return x && x.then && typeof x.then === 'function';
}
// 异步调用方法 cb
function nextTick(cb) {
    if (!cb)
        return;
    if (setImmediate) {
        setImmediate(cb);
    }
    else {
        setTimeout(cb, 0);
    }
}
function createArray(num, init) {
    if (num === void 0) { num = 0; }
    var arr = [];
    for (var i = 0; i < num; i++) {
        arr.push(init);
    }
    return arr;
}
// 处理 下一个 promise
function procedure(promise, x) {
    if (promise === x) {
        return promise._reject(new TypeError('promise and value cannot be same'));
    }
    if (isPromise(x)) {
        return procedurePromise(promise, x);
    }
    if (isThenable(x)) {
        return procedureThenable(promise, x);
    }
    return promise._resolve(x);
}
// 处理 promise 类型值
function procedurePromise(promise, x) {
    if (x.state === 'fulfilled') {
        promise._resolve(x.value);
    }
    if (x.state === 'rejected') {
        promise._reject(x.value);
    }
    x.then(promise._resolve.bind(promise), promise._reject.bind(promise));
}
// 处理 thenable 类型值
function procedureThenable(promise, x) {
    var called = false;
    var resolve = function (y) {
        if (called)
            return;
        procedure(promise, y);
        called = true;
    };
    var reject = function (e) {
        if (called)
            return;
        promise._reject(e);
        called = true;
    };
    try {
        x.then(resolve, reject);
    }
    catch (e) {
        promise._reject(e);
    }
}
var Promise$1 = (function () {
    // FIXME: 有些许不规范，resolver 真实是必需传入项
    function Promise(resolver) {
        // 当前 Promise 状态
        this.state = 'pending';
        // 存储 then 回调
        this.next = [];
        if (resolver && typeof resolver !== 'function')
            throw new Error("Promise resolver " + resolver + " is not a function");
        if (resolver)
            resolver(this._resolve.bind(this), this._reject.bind(this));
    }
    /**
     * 快速创建一个 promise 是实例，且 state 为 fulfilled
     *
     * 使用：
     *    > Promise.resolve(1)
     *    > Promise.resolve(<promise>)
     *    > Promise.resolve(<thenable>)
     */
    Promise.resolve = function (value) {
        var promise = new Promise();
        procedure(promise, value);
        return promise;
    };
    /**
     * 快速创建一个 promise 实例，且 state 为 rejected
     *
     * 使用：
     *    > Promise.resolve(1)
     *    > Promise.resolve(<any>)
     */
    Promise.reject = function (value) {
        return new Promise(function (resolve, reject) {
            reject(value);
        });
    };
    Promise.all = function (list) {
        return new Promise(function (resolve, reject) {
            var states = createArray(list.length, false);
            var values = createArray(list.length, undefined);
            var _loop_1 = function(i, len) {
                var item = list[i];
                var promise = new Promise();
                procedure(promise, item);
                promise.then(function (x) {
                    values[i] = x;
                    states[i] = true;
                    if (states.every(function (y) { return !!y; })) {
                        resolve(values);
                    }
                }, reject);
            };
            for (var i = 0, len = list.length; i < len; i++) {
                _loop_1(i, len);
            }
        });
    };
    Promise.race = function (list) {
        return new Promise(function (resolve, reject) {
            var state = false;
            var value;
            for (var i = 0, len = list.length; i < len; i++) {
                var item = list[i];
                var promise = new Promise();
                procedure(promise, item);
                promise.then(function (x) {
                    if (state)
                        return;
                    state = true;
                    value = x;
                    resolve(value);
                }, reject);
            }
        });
    };
    /**
     * Promise then 方法
     *
     * @param resolve
     * @param reject
     */
    Promise.prototype.then = function (resolve, reject) {
        var _this = this;
        var nextPromise = new Promise();
        if (this.state === 'pending') {
            this.next.push({
                resolve,
                reject,
                promise: nextPromise,
            });
            return nextPromise;
        }
        if (this.state === 'fulfilled') {
            // fulfilled'
            if (typeof resolve === 'function') {
                nextTick(function () {
                    try {
                        var x = resolve(_this.value);
                        procedure(nextPromise, x);
                    }
                    catch (e) {
                        nextPromise._reject(e);
                    }
                });
            }
            else {
                nextPromise._resolve(this.value);
            }
            return nextPromise;
        }
        if (this.state === 'rejected') {
            // rejected
            if (typeof reject === 'function') {
                nextTick(function () {
                    try {
                        var x = reject(_this.value);
                        procedure(nextPromise, x);
                    }
                    catch (e) {
                        nextPromise._reject(e);
                    }
                });
            }
            else {
                nextPromise._reject(this.value);
            }
            return nextPromise;
        }
        return nextPromise;
    };
    Promise.prototype.catch = function (reject) {
        return this.then(void 0, reject);
    };
    Promise.prototype._resolve = function (value) {
        if (this.state !== 'pending')
            return;
        this.state = 'fulfilled';
        this.value = value;
        this._callbacks();
    };
    Promise.prototype._reject = function (value) {
        if (this.state !== 'pending')
            return;
        this.state = 'rejected';
        this.value = value;
        this._callbacks();
    };
    Promise.prototype._callbacks = function () {
        var _this = this;
        if (!this.next.length)
            return;
        var _loop_2 = function(i, len) {
            var _a = this_1.next[i], resolve = _a.resolve, reject = _a.reject, promise = _a.promise;
            var cb = this_1.state === 'fulfilled' ? resolve : reject;
            nextTick(function () {
                try {
                    var x = typeof cb === 'function' ? cb(_this.value) : _this.value;
                    procedure(promise, x);
                }
                catch (e) {
                    promise._reject(e);
                }
            });
        };
        var this_1 = this;
        for (var i = 0, len = this.next.length; i < len; i++) {
            _loop_2(i, len);
        }
    };
    return Promise;
}());

export default Promise$1;
