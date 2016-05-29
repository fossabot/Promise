import Promise from '../src/index';

function testThenFunction(expect) {
  it("have then function", function () {
    let promise = new Promise();
    let bool = typeof promise.then === "function";
    expect(bool).to.be.true;
  });

  it("implement basic functionality", function () {
    let promise = new Promise(function (resolve, reject) {
      resolve(1);
    });

    promise.then(function (val) {
      expect(val).to.equal(1);
      return val+1;
    });

    promise.then(function (val) {
      return val+1;
    }).then(function (val) {
      expect(val).to.equal(2);
    });
  });

  it("deal with promise object", function () {
    let promise = new Promise(function (resolve, reject) {
      resolve(1);
    });
    let tmpResolvePromise = new Promise(function (resolve, reject) {
      resolve("a");
    });
    let tmpRejectPromise = new Promise(function (resolve, reject) {
      reject("b");
    });

    promise.then(function (val) {
      return tmpPromise;
    }).then(function (val) {
      expect(val).to.be.equal("a");
    });

    promise.then(function (val) {
      return tmpRejectPromise;
    }).then(function (val) {
      expect(val).to.be.equal("b");
    });
  })
}

export default testThenFunction;
