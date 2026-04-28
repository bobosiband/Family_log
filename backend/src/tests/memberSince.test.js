import { authRegisterUser } from '../implementations/auth.js';
import { getData } from '../dataStore.js';

describe('memberSince on registration', () => {
  beforeEach(() => {
    const data = getData();
    data.users.length = 0;
    data.totalusersevercreated = 0;
  });

  test('new user has a memberSince field after registration', async () => {
    const result = await authRegisterUser('Test', 'User', 'testuser', 'test@test.com', 'StrongP@ss!!1');
    expect(result.newUser).toHaveProperty('memberSince');
    expect(typeof result.newUser.memberSince).toBe('string');
    expect(new Date(result.newUser.memberSince).toString()).not.toBe('Invalid Date');
  });

  test('memberSince is approximately the current time', async () => {
    const before = Date.now();
    const result = await authRegisterUser('Test', 'User', 'testuser2', 'test2@test.com', 'StrongP@ss!!1');
    const after = Date.now();
    const memberTime = new Date(result.newUser.memberSince).getTime();
    expect(memberTime).toBeGreaterThanOrEqual(before);
    expect(memberTime).toBeLessThanOrEqual(after);
  });
});