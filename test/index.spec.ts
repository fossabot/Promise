import { add } from '../src/'

describe('@index', () => {
  describe('#add', () => {
    it('should return 0', () => {
      expect(add()).toBe(0)
    })
    it('should return right result', () => {
      expect(add(1, 1)).toBe(2)
      expect(add(1, 2)).toBe(3)
    })
  })
})
