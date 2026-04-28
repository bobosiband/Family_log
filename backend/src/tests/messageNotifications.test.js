import { jest } from '@jest/globals';

const sendEmailMock = jest.fn().mockResolvedValue(undefined);

await jest.unstable_mockModule('../services/emailService.js', () => ({
  sendEmail: sendEmailMock,
}));

const { notifyMessageRecipient } = await import('../implementations/messages.js');

describe('notifyMessageRecipient', () => {
  beforeEach(() => {
    sendEmailMock.mockClear();
  });

  test('sends a message notification email to the recipient', async () => {
    await notifyMessageRecipient(
      { username: 'alice', email: 'alice@test.com' },
      { name: 'Bob', email: 'bob@test.com' },
      'Hello there',
      'This is the message body'
    );

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock).toHaveBeenCalledWith(
      'bob@test.com',
      'New message: Hello there',
      expect.stringContaining('<strong>alice</strong> sent you a message on Fam Logs.')
    );
  });

  test('skips notification when the sender email is missing', async () => {
    await notifyMessageRecipient(
      { username: 'alice' },
      { name: 'Bob', email: 'bob@test.com' },
      'Hello there',
      'This is the message body'
    );

    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});