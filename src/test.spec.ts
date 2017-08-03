import { expect } from 'chai';

import { hello } from '../src/index';

describe('Hello const', () => {
  it('should return hello world', () => {
    expect(hello.msg).to.equal('Hello world');
  });
});