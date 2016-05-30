/**
 * promise-elixir
 *
 * Copyright © 2016 blackcater. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import chai from 'chai';

import testInit from './PromiseInitSpec';
import testThenFunction from './PromiseThenSpec';


describe('Promise Elixir', () => {
  const expect = chai.expect;

  describe('should pass init test', () => {
    testInit(expect);
  });

  describe('should pass then function test', () => {
    testThenFunction(expect);
  });
});
