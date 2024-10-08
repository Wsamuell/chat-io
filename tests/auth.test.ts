import { beforeEach, describe, expect, test } from 'bun:test';
import { createORMApp } from '../src/controllers/main';
import { resetORMDB } from './utils';
import { PrismaClient } from '@prisma/client';

describe('auth tests', () => {
  const app = createORMApp();
  const prisma = new PrismaClient();
  beforeEach(async () => {
    await resetORMDB(prisma);
  });

  test('POST / signup - normal case', async () => {
    const jsonBody = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const response = await app.request('/api/v1/auth/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonBody),
    });

    expect(response.status).toBe(200);
  });

  test('POST / signup - user already exists', async () => {
    await app.request('/api/v1/auth/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      }),
    });

    const repsonse = await app.request('/api/v1/auth/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      }),
    });

    expect(repsonse.status).toBe(400);
  });

  test('POST /login - success', async () => {
    const res1 = await app.request('/api/v1/chat', {
      method: 'GET',
    });

    expect(res1.status).toBe(401);

    await app.request('/api/v1/auth/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'loginuser@example.com',
        password: 'password123',
        name: 'Login User',
      }),
    });

    const loginResponse = await app.request('/api/v1/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'loginuser@example.com',
        password: 'password123',
      }),
    });

    expect(loginResponse.status).toBe(200);
    //@ts-expect-error [BKMRK Sammy: looks like this returns type any]
    const token = (await loginResponse.json())['token'];
    expect(token).toBeTruthy;

    const res2 = await app.request('/api/v1/chat/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res2.status).toBe(200);
  });

  test('POST /login - non-existing user', async () => {
    const response = await app.request('/api/v1/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nonexisting@example.com',
        password: 'password123',
      }),
    });

    expect(response.status).toBe(401);
  });

  test('POST /register - incorrect body', async () => {
    const jsonBody = {
      email: 'example',
    };

    const response = await app.request('/api/v1/auth/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonBody),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      success: false,
      error: {
        issues: [
          {
            validation: 'email',
            code: 'invalid_string',
            message: 'Invalid email',
            path: ['email'],
          },
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
            path: ['password'],
            message: 'Required',
          },
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
            path: ['name'],
            message: 'Required',
          },
        ],
        name: 'ZodError',
      },
    });
  });

  test('POST /login - incorrect body', async () => {
    const response = await app.request('/api/v1/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'wrong',
      }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      success: false,
      error: {
        issues: [
          {
            validation: 'email',
            code: 'invalid_string',
            message: 'Invalid email',
            path: ['email'],
          },
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
            path: ['password'],
            message: 'Required',
          },
        ],
        name: 'ZodError',
      },
    });
  });
});
