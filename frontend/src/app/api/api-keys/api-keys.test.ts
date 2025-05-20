import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GET, POST } from './route';
import prisma from '@/lib/prisma';

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    apiKey: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('API Keys API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/api-keys', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated session
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/api-keys'));

      // Call the handler
      const response = await GET(req);

      // Assert response
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ message: 'Unauthorized' });
    });

    it('should return API keys for authenticated user', async () => {
      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        expires: '2023-01-01',
      });

      // Mock API keys in database
      const mockApiKeys = [
        {
          id: 'key-1',
          userId: 'user-123',
          service: 'google_ads',
          keyName: 'Google Ads API Key',
          keyValue: 'gads-api-key-12345',
          label: 'Production',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          additionalData: { clientId: '123' },
        },
      ];
      vi.mocked(prisma.apiKey.findMany).mockResolvedValue(mockApiKeys);

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/api-keys'));

      // Call the handler
      const response = await GET(req);

      // Assert response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe('key-1');
      expect(data[0].service).toBe('google_ads');
      // Check that key value is masked
      expect(data[0].keyValue).toBe('gads...2345');
    });
  });

  describe('POST /api/api-keys', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated session
      vi.mocked(getServerSession).mockResolvedValue(null);

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/api-keys'), {
        method: 'POST',
        body: JSON.stringify({
          service: 'google_ads',
          keyName: 'Test Key',
          keyValue: 'test-key-value',
        }),
      });

      // Call the handler
      const response = await POST(req);

      // Assert response
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ message: 'Unauthorized' });
    });

    it('should create a new API key for authenticated user', async () => {
      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        expires: '2023-01-01',
      });

      // Mock created API key
      const mockCreatedKey = {
        id: 'new-key-1',
        userId: 'user-123',
        service: 'google_ads',
        keyName: 'Test Key',
        keyValue: 'test-key-value',
        label: 'Test Label',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        additionalData: null,
      };
      vi.mocked(prisma.apiKey.create).mockResolvedValue(mockCreatedKey);

      // Create mock request with JSON body
      const req = new NextRequest(new URL('http://localhost:3000/api/api-keys'), {
        method: 'POST',
        body: JSON.stringify({
          service: 'google_ads',
          keyName: 'Test Key',
          keyValue: 'test-key-value',
          label: 'Test Label',
        }),
      });

      // Call the handler
      const response = await POST(req);

      // Assert response
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBe('new-key-1');
      expect(data.service).toBe('google_ads');
      expect(data.keyName).toBe('Test Key');
      // Check that key value is masked
      expect(data.keyValue).toBe('test...alue');
    });
  });
});
