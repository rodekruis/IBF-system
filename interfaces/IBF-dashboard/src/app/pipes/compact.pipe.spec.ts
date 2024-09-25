import { CompactPipe } from './compact.pipe';

describe('CompactPipe', () => {
  it('create an instance', () => {
    const pipe = new CompactPipe('en-US');
    expect(pipe).toBeTruthy();
  });
});
