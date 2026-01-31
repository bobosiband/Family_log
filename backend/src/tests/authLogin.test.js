import { authLoginUser, authRegisterUser } from '../implementations/auth.js';
import { getData } from '../dataStore.js';

describe('authLoginUser', () => {
  beforeEach(() => {
    // Reset datastore
    const data = getData();
    data.users.length = 0;
    data.totalusersevercreated = 0;

    // Create a test user
    authRegisterUser(
      'testuser',
      'test@email.com',
      'StrongP@ss!!1'
    );
  });

  test('successfully logs in with correct credentials', () => {
    const result = authLoginUser('testuser', 'StrongP@ss!!1');

    expect(result).toEqual({
      userId: 1,
    });
  });

  test('fails with incorrect password', () => {
    const result = authLoginUser('testuser', 'WrongPassword');

    expect(result).toEqual({
      error: 'invalid credentials',
      message: 'incorrrect username or password',
    });
  });

  test('fails with non-existent username', () => {
    const result = authLoginUser('ghost', 'StrongP@ss!!1');

    expect(result).toEqual({
      error: 'invalid credentials',
      message: 'incorrrect username or password',
    });
  });
});
