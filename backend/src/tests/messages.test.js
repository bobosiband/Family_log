import { sendMessage, getUserMessages, markMessageAsRead } from '../implementations/messages.js';
import { authRegisterUser } from '../implementations/auth.js';
import { getData } from '../dataStore.js';

describe('sendMessage', () => {
  beforeEach(async () => {
    const data = getData();
    data.users.length = 0;
    data.messages.length = 0;
    data.totalusersevercreated = 0;
    data.totalMessagesEverCreated = 0;

    await authRegisterUser('Alice', 'Smith', 'alice', 'alice@test.com', 'StrongP@ss!!1');
    await authRegisterUser('Bob', 'Jones', 'bob', 'bob@test.com', 'StrongP@ss!!1');
  });

  test('successfully sends a message between two users', () => {
    const result = sendMessage(1, 2, 'Hello', 'How are you?');

    expect(result).toHaveProperty('message');
    expect(result.message).toMatchObject({
      id: 1,
      senderId: 1,
      recipientId: 2,
      subject: 'Hello',
      content: 'How are you?',
      read: false,
    });
    expect(getData().messages).toHaveLength(1);
  });

  test('fails when sender does not exist', () => {
    const result = sendMessage(99, 2, 'Hello', 'How are you?');

    expect(result).toEqual({
      error: 'sender not found',
      message: 'sender user does not exist',
    });
  });

  test('fails when recipient does not exist', () => {
    const result = sendMessage(1, 99, 'Hello', 'How are you?');

    expect(result).toEqual({
      error: 'recipient not found',
      message: 'recipient user does not exist',
    });
  });

  test('fails when sender and recipient are the same', () => {
    const result = sendMessage(1, 1, 'Hello', 'How are you?');

    expect(result).toEqual({
      error: 'invalid recipient',
      message: 'you cannot send a message to yourself',
    });
  });

  test('fails when subject is empty', () => {
    const result = sendMessage(1, 2, '   ', 'How are you?');

    expect(result).toEqual({
      error: 'invalid subject',
      message: 'subject cannot be empty',
    });
  });

  test('fails when content is empty', () => {
    const result = sendMessage(1, 2, 'Hello', '   ');

    expect(result).toEqual({
      error: 'invalid content',
      message: 'message content cannot be empty',
    });
  });

  test('fails when subject exceeds 200 characters', () => {
    const result = sendMessage(1, 2, 'a'.repeat(201), 'How are you?');

    expect(result).toEqual({
      error: 'subject too long',
      message: 'subject must be 200 characters or less',
    });
  });
});

describe('getUserMessages', () => {
  beforeEach(async () => {
    const data = getData();
    data.users.length = 0;
    data.messages.length = 0;
    data.totalusersevercreated = 0;
    data.totalMessagesEverCreated = 0;

    await authRegisterUser('Alice', 'Smith', 'alice', 'alice@test.com', 'StrongP@ss!!1');
    await authRegisterUser('Bob', 'Jones', 'bob', 'bob@test.com', 'StrongP@ss!!1');
    sendMessage(1, 2, 'First', 'Hello Bob');
    await new Promise((resolve) => setTimeout(resolve, 5));
    sendMessage(2, 1, 'Reply', 'Hello Alice');
    await new Promise((resolve) => setTimeout(resolve, 5));
    sendMessage(1, 2, 'Second', 'Another note');
  });

  test('returns inbox and sent arrays', () => {
    const result = getUserMessages(1);

    expect(result).toHaveProperty('inbox');
    expect(result).toHaveProperty('sent');
    expect(Array.isArray(result.inbox)).toBe(true);
    expect(Array.isArray(result.sent)).toBe(true);
  });

  test('inbox contains messages sent TO the user', () => {
    const result = getUserMessages(1);

    expect(result.inbox).toHaveLength(1);
    expect(result.inbox[0]).toMatchObject({
      senderId: 2,
      recipientId: 1,
      subject: 'Reply',
    });
  });

  test('sent contains messages sent BY the user', () => {
    const result = getUserMessages(1);

    expect(result.sent).toHaveLength(2);
    expect(result.sent[0].senderId).toBe(1);
    expect(result.sent[1].senderId).toBe(1);
  });

  test('messages are sorted newest first', () => {
    const result = getUserMessages(1);

    expect(result.sent[0].subject).toBe('Second');
    expect(result.sent[1].subject).toBe('First');
  });

  test('returns empty arrays when user has no messages', async () => {
    await authRegisterUser('Cara', 'Doe', 'cara', 'cara@test.com', 'StrongP@ss!!1');
    const result = getUserMessages(3);

    expect(result).toEqual({ inbox: [], sent: [] });
  });

  test('fails when user does not exist', () => {
    const result = getUserMessages(99);

    expect(result).toEqual({
      error: 'user not found',
      message: 'user does not exist',
    });
  });
});

describe('markMessageAsRead', () => {
  beforeEach(async () => {
    const data = getData();
    data.users.length = 0;
    data.messages.length = 0;
    data.totalusersevercreated = 0;
    data.totalMessagesEverCreated = 0;

    await authRegisterUser('Alice', 'Smith', 'alice', 'alice@test.com', 'StrongP@ss!!1');
    await authRegisterUser('Bob', 'Jones', 'bob', 'bob@test.com', 'StrongP@ss!!1');
    sendMessage(1, 2, 'Hello', 'How are you?');
  });

  test('marks a message as read when called by the recipient', () => {
    const result = markMessageAsRead(1, 2);

    expect(result).toEqual({ success: true });
    expect(getData().messages[0].read).toBe(true);
  });

  test('fails when called by a non-recipient', () => {
    const result = markMessageAsRead(1, 1);

    expect(result).toEqual({
      error: 'unauthorized',
      message: 'you are not the recipient of this message',
    });
  });

  test('fails when message does not exist', () => {
    const result = markMessageAsRead(99, 2);

    expect(result).toEqual({
      error: 'message not found',
      message: 'message does not exist',
    });
  });
});