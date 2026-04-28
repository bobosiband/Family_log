import { authLoginUser, authRegisterUser } from '../implementations/auth.js';
import { getData } from '../dataStore.js';
import bcrypt from 'bcrypt';



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

  test('logs in legacy plain-text passwords and upgrades them to bcrypt', async () => {
    const data = getData();
    data.users.push({
      id: 99,
      name: 'Legacy',
      surname: 'User',
      username: 'legacyuser',
      email: 'legacy@email.com',
      password: 'LegacyPass!!11',
      bio: '',
      profilePictureUrl: '/uploads/profilePictures/default.png',
      memberSince: new Date().toISOString(),
      passwordHistory: ['LegacyPass!!11'],
    });

    const result = await authLoginUser('legacyuser', 'LegacyPass!!11');

    expect(result).toMatchObject({
      id: 99,
      username: 'legacyuser',
      email: 'legacy@email.com',
    });
    expect(await bcrypt.compare('LegacyPass!!11', data.users[1].password)).toBe(true);
    expect(data.users[1].passwordHistory).toHaveLength(1);
    expect(await bcrypt.compare('LegacyPass!!11', data.users[1].passwordHistory[0])).toBe(true);
  });
});
