import { authRegisterUser } from '../implementations/auth.js';
import { getData } from '../dataStore.js';
import e from 'express';

describe('authRegisterUser', () => {
  beforeEach(() => {
    // Reset in-memory datastore before every test
    const data = getData();
    data.users.length = 0;
    data.totalusersevercreated = 0;
  });

  test('successfully registers a new user', () => {
    const result = authRegisterUser(
      'validuser',
      'valid@email.com',
      'StrongP@ss!!1'
    );

    expect(result).toHaveProperty('newUser');
    expect(result.newUser).toMatchObject({
      id: 1,
      username: 'validuser',
      email: 'valid@email.com',
      password: 'StrongP@ss!!1',
    });

    const data = getData();
    expect(data.users).toHaveLength(1);
  });

  test('fails when username is invalid', () => {
    const result = authRegisterUser(
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

  test('fails when email is invalid', () => {
    const result = authRegisterUser(
      'validuser',
      'invalid-email',
      'StrongP@ss!!1'
    );

    expect(result).toEqual({
      error: 'invalid email',
      message: 'email is not in the correct format)',
    });
  });

  test('fails when password is weak', () => {
    const result = authRegisterUser(
      'validuser',
      'valid@email.com',
      'password'
    );

    expect(result).toHaveProperty('error');
    expect(result.error).toBe('weak password');
  });

  test('fails when username already exists', () => {
    authRegisterUser(
      'duplicate',
      'first@email.com',
      'StrongP@ss!!1'
    );

    const result = authRegisterUser(
      'duplicate',
      'second@email.com',
      'StrongP@ss!!1'
    );

    expect(result).toEqual({
      error: 'invalid credentials',
      message: 'user with that email or username already exits',
    });
  });

  test('fails when email already exists', () => {
    authRegisterUser(
      'userone',
      'same@email.com',
      'StrongP@ss!!1'
    );

    const result = authRegisterUser(
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
