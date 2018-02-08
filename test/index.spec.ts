import Promise from '../src/'

describe('Promise', () => {
  describe('#then', () => {
    test('promise resolve a value immediately', () => {
      expect.assertions(7)

      const onFulfilledFunc = jest.fn(x => x)
      const onRejectedFunc = jest.fn(x => x)
      const promise = Promise.resolve(1).then(onFulfilledFunc, onRejectedFunc)

      expect(promise.state).toBe('pending')
      expect(onFulfilledFunc).not.toHaveBeenCalled()
      expect(onRejectedFunc).not.toHaveBeenCalled()

      return promise.then(x => {
        expect(x).toBe(1)
        expect(onFulfilledFunc).toHaveBeenCalled()
        expect(onFulfilledFunc).toHaveBeenCalledTimes(1)
        expect(onRejectedFunc).not.toHaveBeenCalled()
      })
    })
    test('promise resolve a value after a few time', () => {
      expect.assertions(7)

      const onFulfilledFunc = jest.fn(x => x)
      const onRejectedFunc = jest.fn(x => x)
      const promise = new Promise(resolve =>
        setTimeout(() => resolve(1), 200)
      ).then(onFulfilledFunc, onRejectedFunc)

      expect(promise.state).toBe('pending')
      expect(onFulfilledFunc).not.toHaveBeenCalled()
      expect(onRejectedFunc).not.toHaveBeenCalled()

      return promise.then(x => {
        expect(x).toBe(1)
        expect(onFulfilledFunc).toHaveBeenCalled()
        expect(onFulfilledFunc).toHaveBeenCalledTimes(1)
        expect(onRejectedFunc).not.toHaveBeenCalled()
      })
    })
    test('promise reject a value immediately', () => {
      expect.assertions(7)

      const onFulfilledFunc = jest.fn(x => x)
      const onRejectedFunc = jest.fn(x => x)
      const promise = Promise.reject(1).then(onFulfilledFunc, onRejectedFunc)

      expect(promise.state).toBe('pending')
      expect(onFulfilledFunc).not.toHaveBeenCalled()
      expect(onRejectedFunc).not.toHaveBeenCalled()

      return promise.then(x => {
        expect(x).toBe(1)
        expect(onFulfilledFunc).not.toHaveBeenCalled()
        expect(onRejectedFunc).toHaveBeenCalled()
        expect(onRejectedFunc).toHaveBeenCalledTimes(1)
      })
    })
    test('promise reject a value after a few time', () => {
      expect.assertions(7)

      const onFulfilledFunc = jest.fn(x => x)
      const onRejectedFunc = jest.fn(x => x)
      const promise = new Promise((resolve, reject) =>
        setTimeout(() => reject(1), 200)
      ).then(onFulfilledFunc, onRejectedFunc)

      expect(promise.state).toBe('pending')
      expect(onFulfilledFunc).not.toHaveBeenCalled()
      expect(onRejectedFunc).not.toHaveBeenCalled()

      return promise.then(x => {
        expect(x).toBe(1)
        expect(onFulfilledFunc).not.toHaveBeenCalled()
        expect(onRejectedFunc).toHaveBeenCalled()
        expect(onRejectedFunc).toHaveBeenCalledTimes(1)
      })
    })
  })
  describe('#catch', () => {
    //  同步 promise reject，catch
    test('promise reject a value immediately', () => {
      expect.assertions(4)

      const rejectFunc = jest.fn(x => x)
      const promise = Promise.reject(1).catch(rejectFunc)

      expect(promise.state).toBe('pending')
      expect(rejectFunc).toHaveBeenCalled()
      expect(rejectFunc).toHaveBeenCalledTimes(1)

      return promise.then(x => expect(x).toBe(1))
    })
    // 异步 promise reject，catch
    test('promise reject a value after a few time', () => {
      expect.assertions(5)

      const rejectFunc = jest.fn(x => x)
      const promise = new Promise((resolve, reject) =>
        setTimeout(() => reject(1), 200)
      ).catch(rejectFunc)

      expect(promise.state).toBe('pending')
      expect(rejectFunc).not.toHaveBeenCalled()

      return promise.then(x => {
        expect(x).toBe(1)
        expect(rejectFunc).toHaveBeenCalled()
        expect(rejectFunc).toHaveBeenCalledTimes(1)
      })
    })
    // 同步 promise resolve catch
    test('promise resolve a value immediately', () => {
      expect.assertions(3)

      const rejectFunc = jest.fn(x => x)
      const promise = Promise.resolve(1).catch(rejectFunc)

      expect(promise.state).toBe('pending')
      expect(rejectFunc).not.toHaveBeenCalled()

      return promise.then(x => expect(x).toBe(1))
    })
    // 异步 promise resolve catch
    test('promise resolve a value after a few time', () => {
      expect.assertions(4)

      const rejectFunc = jest.fn(x => x)
      const promise = new Promise(resolve =>
        setTimeout(() => resolve(1), 200)
      ).catch(rejectFunc)

      expect(promise.state).toBe('pending')
      expect(rejectFunc).not.toHaveBeenCalled()

      return promise.then(x => {
        expect(x).toBe(1)
        expect(rejectFunc).not.toHaveBeenCalled()
      })
    })
  })
  describe('Promise@resolve', () => {
    test('resolve normal value', () => {
      expect.assertions(2)

      const promise = Promise.resolve(1)

      expect(promise.state).toBe('fulfilled')

      return promise.then(x => expect(x).toBe(1))
    })
    test('resolve promise value which resolve a normal value', () => {
      expect.assertions(2)

      const promise = Promise.resolve(Promise.resolve(1))

      expect(promise.state).toBe('fulfilled')

      return promise.then(x => expect(x).toBe(1))
    })
    test('resolve promise value which reject a normal value', () => {
      expect.assertions(2)

      const promise = Promise.resolve(Promise.reject(1))

      expect(promise.state).toBe('rejected')

      return promise.catch(x => expect(x).toBe(1))
    })
    test('resolve thenable value which resolve a normal value', () => {
      expect.assertions(2)

      const promise = Promise.resolve({
        then(resolve) {
          resolve(1)
        },
      })

      expect(promise.state).toBe('fulfilled')

      return promise.then(x => expect(x).toBe(1))
    })
    test('resolve thenable value which reject a normal value', () => {
      expect.assertions(2)

      const promise = Promise.resolve({
        then(resolve, reject) {
          reject(1)
        },
      })

      expect(promise.state).toBe('rejected')

      return promise.catch(x => expect(x).toBe(1))
    })
  })
  describe('Promise@reject', () => {
    test('reject normal value', () => {
      expect.assertions(2)

      const promise = Promise.reject(1)

      expect(promise.state).toBe('rejected')

      return promise.catch(x => expect(x).toBe(1))
    })
    test('reject promise value which resolve a normal value', () => {
      expect.assertions(2)

      const value = Promise.resolve(1)
      const promise = Promise.reject(value)

      expect(promise.state).toBe('rejected')

      return promise.catch(x => expect(x).toBe(value))
    })
    test('reject promise value which reject a normal value', () => {
      expect.assertions(2)

      const value = Promise.reject(1)
      const promise = Promise.reject(value)

      expect(promise.state).toBe('rejected')

      return promise.catch(x => expect(x).toBe(value))
    })
    test('reject thenable value which resolve a normal value', () => {
      expect.assertions(2)

      const value = {
        then(resolve) {
          resolve(1)
        },
      }
      const promise = Promise.reject(value)

      expect(promise.state).toBe('rejected')

      return promise.catch(x => expect(x).toBe(value))
    })
    test('reject thenable value which reject a normal value', () => {
      expect.assertions(2)

      const value = {
        then(resolve, reject) {
          reject(1)
        },
      }
      const promise = Promise.reject(value)

      expect(promise.state).toBe('rejected')

      return promise.catch(x => expect(x).toBe(value))
    })
  })
  // describe('Promise@all', () => {
  //
  // })
  // describe('Promise@race', () => {
  //
  // })
  describe('#constructor', () => {
    test('create promise without resolver', () => {
      const promise = new Promise()

      expect(promise.state).toBe('pending')
    })
    test('create promise with resolver, multiple called resolve', () => {
      expect.assertions(2)

      const promise = new Promise((resolve, reject) => {
        resolve(1)
        resolve(2)
        resolve(3)
      })

      expect(promise.state).toBe('fulfilled')

      return promise.then(x => expect(x).toBe(1))
    })
    test('create promise with resolver, multiple called resolve and has called async resolve', () => {
      expect.assertions(2)

      const promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(1), 200)
        resolve(2)
        resolve(3)
      })

      expect(promise.state).toBe('fulfilled')

      return promise.then(x => expect(x).toBe(2))
    })
    test('create promise with resolver, called async resolve', () => {
      expect.assertions(2)

      const promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(1), 200)
      })

      expect(promise.state).toBe('pending')

      return promise.then(x => expect(x).toBe(1))
    })
    test('create promise with resolver, multiple called reject', () => {
      expect.assertions(2)

      const promise = new Promise((resolve, reject) => {
        reject(1)
        reject(2)
        reject(3)
      })

      expect(promise.state).toBe('rejected')

      return promise.catch(x => expect(x).toBe(1))
    })
    test('create promise with resolver, multiple called reject and has called async reject', () => {
      expect.assertions(2)

      const promise = new Promise((resolve, reject) => {
        setTimeout(() => reject(1), 200)
        reject(2)
        reject(3)
      })

      expect(promise.state).toBe('rejected')

      return promise.catch(x => expect(x).toBe(2))
    })
    test('create promise with resolver, called async reject', () => {
      expect.assertions(2)

      const promise = new Promise((resolve, reject) => {
        setTimeout(() => reject(1), 200)
      })

      expect(promise.state).toBe('pending')

      return promise.catch(x => expect(x).toBe(1))
    })
  })
})
