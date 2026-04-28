import { authRegisterUser } from '../implementations/auth.js';
import { getData } from '../dataStore.js';

describe('authRegisterUser', () => {
  beforeEach(() => {
    // Reset in-memory datastore before every test
    const data = getData();
    data.users.length = 0;
    data.totalusersevercreated = 0;
  });

  test('successfully registers a new user', async () => {
    const result = await authRegisterUser(
      'Valid',
      'User',
      'validuser',
      'valid@email.com',
      'StrongP@ss!!1'
    );

    expect(result).toHaveProperty('newUser');
    expect(result.newUser).toMatchObject({
      id: 1,
      username: 'validuser',
      email: 'valid@email.com',
    });
    expect(result.newUser.password).not.toBe('StrongP@ss!!1');
    expect(result.newUser).toHaveProperty('memberSince');

    const data = getData();
    expect(data.users).toHaveLength(1);
  });

  test('fails when username is invalid', async () => {
    const result = await authRegisterUser(
      'Valid',
      'User',
      'x',
      'valid@email.com',
      'StrongP@ss!!1'
    );

    expect(result).toEqual({
      error: 'invalid username',
      message:
        'username must be alphanumeric and between 3 and 30 characters',
    });
  });

  test('fails when email is invalid', async () => {
    const result = await authRegisterUser(
      'Valid',
      'User',
      'validuser',
      'invalid-email',
      'StrongP@ss!!1'
    );

    expect(result).toEqual({
      error: 'invalid email',
      message: 'email is not in the correct format)',
    });
  });

  test('fails when password is weak', async () => {
    const result = await authRegisterUser(
      'Valid',
      'User',
      'validuser',
      'valid@email.com',
      'password'
    );

    expect(result).toHaveProperty('error');
    expect(result.error).toBe('weak password');
  });

  test('fails when username already exists', async () => {
    await authRegisterUser(
      'Duplicate',
      'User',
      'duplicate',
      'first@email.com',
      'StrongP@ss!!1'
    );

    const result = await authRegisterUser(
      'Duplicate',
      'User',
      'duplicate',
      'second@email.com',
      'StrongP@ss!!1'
    );

    expect(result).toEqual({
      error: 'invalid credentials',
      message: 'user with that email or username already exits',
    });
  });

  test('fails when email already exists', async () => {
    await authRegisterUser(
      'User',
      'One',
      'userone',
      'same@email.com',
      'StrongP@ss!!1'
    );

    const result = await authRegisterUser(
      'User',
      'Two',
      'usertwo',
      'same@email.com',
      'StrongP@ss!!1'
    );

    expect(result).toEqual({
      error: 'invalid credentials',
      message: 'user with that email or username already exits',
    });
  });
});
