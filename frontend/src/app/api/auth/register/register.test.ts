import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from './route';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

// Mock dependencies
vi.mock('bcrypt', () => ({
  hash: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('User Registration API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    // Create mock request with missing fields
    const req = new NextRequest(new URL('http://localhost:3000/api/auth/register'), {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        // Missing email and password
      }),
    });

    // Call the handler
    const response = await POST(req);

    // Assert response
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'Missing required fields' });
  });

  it('should return 409 if user already exists', async () => {
    // Mock existing user
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'existing-user',
      email: 'existing@example.com',
      name: 'Existing User',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: null,
      image: null,
    });

    // Create mock request
    const req = new NextRequest(new URL('http://localhost:3000/api/auth/register'), {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      }),
    });

    // Call the handler
    const response = await POST(req);

    // Assert response
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ message: 'User with this email already exists' });
  });

  it('should create a new user successfully', async () => {
    // Mock user not found
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    // Mock password hashing
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password-123');

    // Mock user creation
    const mockCreatedUser = {
      id: 'new-user-123',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: null,
      image: null,
    };
    vi.mocked(prisma.user.create).mockResolvedValue(mockCreatedUser);

    // Create mock request
    const req = new NextRequest(new URL('http://localhost:3000/api/auth/register'), {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    // Call the handler
    const response = await POST(req);

    // Assert response
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.message).toBe('User registered successfully');
    expect(data.user).toEqual({
      id: 'new-user-123',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      emailVerified: null,
      image: null,
    });
    // Password should not be included in the response
    expect(data.user.password).toBeUndefined();
  });
});
