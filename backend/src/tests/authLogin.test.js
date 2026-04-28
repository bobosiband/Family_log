import { authLoginUser, authRegisterUser } from '../implementations/auth.js';
import { getData } from '../dataStore.js';



describe('authLoginUser', () => {
  beforeEach(() => {
    // Reset datastore
    const data = getData();
    data.users.length = 0;
    data.totalusersevercreated = 0;

    // Create a test user
    return authRegisterUser('Test', 'User', 'testuser', 'test@email.com', 'StrongP@ss!!1');
  });

  test('successfully logs in with correct credentials', async () => {
    const result = await authLoginUser('testuser', 'StrongP@ss!!1');

    expect(result).toMatchObject({
      id: 1,
      username: 'testuser',
      email: 'test@email.com',
    });
    expect(result).toHaveProperty('memberSince');
  });

  test('fails with incorrect password', async () => {
    const result = await authLoginUser('testuser', 'WrongPassword');

    expect(result).toEqual({
      error: 'invalid credentials',
      message: 'incorrrect username or password',
    });
  });

  test('fails with non-existent username', async () => {
    const result = await authLoginUser('ghost', 'StrongP@ss!!1');

    expect(result).toEqual({
      error: 'invalid credentials',
      message: 'incorrrect username or password',
    });
  });
});
