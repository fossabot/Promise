/**
 * Created by blackcater on 16/5/29.
 */
import Promise from '../src/index';

function testInit(expect){
  it("should have Pending state when initialize", function () {
    let promise = new Promise();
    expect(promise._state).to.equal("Pending");
  });
}

export default testInit;
