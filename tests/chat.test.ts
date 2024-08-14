import { beforeEach, describe, expect, test } from 'bun:test';
import { createInMemoryApp } from '../src/controllers/main';

describe('chat tests', () => {
  let app = createInMemoryApp();
  beforeEach(async () => {
    app = createInMemoryApp();
  });

  async function getToken(email = 'test@test.com'): Promise<string> {
    await app.request('/api/v1/auth/signup/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: 'password123',
        name: 'Chat User',
      }),
    });

    const loginResponse = await app.request('/api/v1/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: 'password123',
      }),
    });

    //@ts-expect-error [BKMRK Sammy: looks like this returns type any]
    const token = (await loginResponse.json()).token;
    return token!;
  }
  async function createChat(token: string) {
    const createChatResponse = await app.request('/api/v1/chat/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Test Chat',
      }),
    });
    const response = await createChatResponse.json();

    //@ts-expect-error [BKMRK Sammy: looks like this returns type unknown]
    const chatId = response.data.id;
    return chatId;
  }

  test('GET /chat/ - get user chats', async () => {
    const token = await getToken();
    const chatId = await createChat(token);
    const response = await app.request('/api/v1/chat/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(200);
    const responseData = await response.json();

    //@ts-expect-error [BKMRK Sammy: looks like this returns type unknown]
    const data = responseData.data;
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBe(1);
    expect(data[0].id).toBe(chatId);
  });

  test('GET /chat/ - get user thats when multiple chat and user are available', async () => {
    const token = await getToken();
    const token2 = await getToken('email@email.com');
    const chatId = await createChat(token);
    const chatId2 = await createChat(token2);

    const response = await app.request('/api/v1/chat/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(200);
    const responseData = await response.json();

    //@ts-expect-error [BKMRK Sammy: looks like this returns type unknown]
    const data = responseData.data;
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBe(1);
    expect(data[0].id).toBe(chatId);

    const response2 = await app.request('/api/v1/chat/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token2}` },
    });
    expect(response2.status).toBe(200);
    const response2Data = await response2.json();

    //@ts-expect-error [BKMRK Sammy: looks like this returns type unknown]
    const data2 = response2Data.data;
    expect(Array.isArray(data2)).toBeTruthy();
    expect(data2.length).toBe(1);
    expect(data2[0].id).toBe(chatId2);
  });

  test('POST, GET /chat/:id/message/ - create and get chat messages', async () => {
    const token = await getToken();
    const chatId = await createChat(token);
    await app.request(`/api/v1/chat/${chatId}/message/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: 'Hello World',
      }),
    });

    const response = await app.request(`/api/v1/chat/${chatId}/message/`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    const messages = await response.json();
    //@ts-expect-error [BKMRK Sammy: looks like this returns type unknown]
    expect(messages.data).toBeInstanceOf(Array);
    //@ts-expect-error [BKMRK Sammy: looks like this returns type unknown]
    expect(messages.data.length).toBe(2);
    //@ts-expect-error [BKMRK Sammy: looks like this returns type unknown]
    expect(messages.data[0].message).toBe('Hello World');
    //@ts-expect-error [BKMRK Sammy: looks like this returns type unknown]
    expect(messages.data[1].message).toBe('dummy response');
  });
});
