const { expect } = require('chai');
const { validateSignupData } = require('../util/validators');

describe('validators', function() {
  describe('signup data)', function() {
    it('returns valid is true when signup data is valid', () => {
      const signup = {
        email: 'test@test.com',
        password: 'password',
        confirmPassword: 'password',
        handle: 'testHandle',
      };
      const { isValid } = validateSignupData(signup);
      expect(isValid).to.equal(true);
    });

    it('returns valid is false when email is empty', () => {
      const signup = {
        email: '',
        password: 'password',
        confirmPassword: 'password',
        handle: 'testHandle',
      };
      const { isValid } = validateSignupData(signup);
      expect(isValid).to.equal(false);
    });

    it('returns valid is false when email is not in correct format', () => {
      const signup = {
        email: 'testEmailAddress',
        password: 'password',
        confirmPassword: 'password',
        handle: 'testHandle',
      };
      const { isValid } = validateSignupData(signup);
      expect(isValid).to.equal(false);
    });
  });
});
