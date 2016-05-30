import Promise from '../src/index';

function testThenFunction(expect) {
  it('have then function', () => {
    const promise = new Promise();
    const bool = typeof promise.then === 'function';
    expect(bool).to.be.true;
  });

  it('implement basic functionality', () => {
    const promise = new Promise(resolve => resolve(1));

    promise.then((val) => {
      expect(val).to.equal(1);
      return val + 1;
    });

    promise.then(val => (val + 1))
           .then((val) => {
             expect(val).to.equal(2);
           });
  });

  it('deal with promise object', () => {
    const promise = new Promise(resolve => resolve(1));
    const tmpResolvePromise = new Promise(resolve => resolve('a'));
    const tmpRejectPromise = new Promise((resolve, reject) => reject('b'));

    promise.then(() => tmpResolvePromise)
           .then(val => {
             expect(val).to.be.equal('a');
           });

    promise.then(() => tmpRejectPromise);
  });
}

export default testThenFunction;
