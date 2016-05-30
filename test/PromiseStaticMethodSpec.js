import Promise from '../src/index';

function testStaticFunction(expect) {
  it('pass Promise.resolve function test', () => {
    const promise1 = Promise.resolve(1);
    promise1.then(function (val) {
      expect(val).to.equal(1);
    });

    const promise2 = Promise.resolve({
      then: function (resolve) {
        resolve(2);
      }
    });
    promise2.then(function (val) {
      expect(val).to.equal(2);
    });
  });

  it('pass Promise.reject function test', () => {
    const promise = Promise.reject(1);
    promise.catch(function (val) {
      expect(val).to.equal(1);
    });
  });

  it('pass Promise.all function test', () => {
    const promise1 = Promise.resolve(1);
    const promise2 = Promise.resolve(2);
    const promise3 = Promise.resolve(3);
    const promise4 = Promise.reject(4);

    const resultPromise1 = Promise.all([promise1, promise2, promise3]);
    resultPromise1.then(val => {
      expect(val).to.eql([1, 2, 3]);
    });

    const resultPromise2 = Promise.all([promise2, promise3, promise4]);
    resultPromise2.catch(val => {
      expect(val).to.equal(4);
    });
  });

  it('pass Promise.race function test', () => {
    const promise1 = Promise.resolve(1);
    const promise2 = Promise.resolve(2);
    const promise3 = Promise.resolve(3);
    const promise4 = Promise.reject(4);

    const resultPromise1 = Promise.all([promise1, promise2, promise3]);
    resultPromise1.then(val => {
      expect(val).to.eql(1);
    });

    const resultPromise2 = Promise.all([promise2, promise3, promise4]);
    resultPromise2.then(val => {
      expect(val).to.equal(2);
    });

    const resultPromise3 = Promise.all([promise4, promise2, promise3]);
    resultPromise3.catch(val => {
      expect(val).to.equal(4);
    });
  });
}

export default testStaticFunction;
