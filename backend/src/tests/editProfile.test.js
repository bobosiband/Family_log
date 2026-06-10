import { editProfile } from '../implementations/edits.js';
import { authRegisterUser } from '../implementations/auth.js';
import { getData } from '../dataStore.js';

describe('editProfile', () => {
  beforeEach(async () => {
    const data = getData();
    data.users.length = 0;
    data.totalusersevercreated = 0;
    await authRegisterUser('Alice', 'Smith', 'alice', 'alice@test.com', 'StrongP@ss!!1');
  });

  test('successfully updates profile with valid inputs', () => {
    const result = editProfile(1, 'Alicia', 'Smithy', 'alicia', 'bio text', 'alicia@test.com');

    expect(result).toMatchObject({
      id: 1,
      name: 'Alicia',
      surname: 'Smithy',
      username: 'alicia',
      email: 'alicia@test.com',
    });
    expect(result).not.toHaveProperty('password');
  });

  test('returns clean 400 error when name is missing (undefined)', () => {
    const result = editProfile(1, undefined, 'Smith', 'alice', '', 'alice@test.com');

    expect(result).toEqual({
      error: 'invalid name',
      message: 'name cannot be empty',
    });
  });

  test('returns clean 400 error when surname is null', () => {
    const result = editProfile(1, 'Alice', null, 'alice', '', 'alice@test.com');

    expect(result).toEqual({
      error: 'invalid surname',
      message: 'surname cannot be empty',
    });
  });

  test('returns clean 400 error when username is invalid', () => {
    const result = editProfile(1, 'Alice', 'Smith', 42, '', 'alice@test.com');

    expect(result).toEqual({
      error: 'invalid username',
      message: 'username must be alphanumeric and between 3 and 30 characters',
    });
  });

  test('treats missing bio as empty string without throwing', () => {
    const result = editProfile(1, 'Alice', 'Smith', 'alice', undefined, 'alice@test.com');

    expect(result).toMatchObject({ id: 1, bio: '' });
  });
});
