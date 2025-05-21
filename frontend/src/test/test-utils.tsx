/**
 * Frontend Test Utilities
 * 
 * Utilities for testing React components
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'queries'> {
  queryClient?: QueryClient;
}

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }
  
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

/**
 * Mock Next.js router
 */
export function mockNextRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    reload: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isFallback: false,
    isReady: true,
    query: {},
    asPath: '/',
    pathname: '/',
    basePath: '',
  };
}

/**
 * Mock Next.js session
 */
export function mockNextAuthSession(session: any = null) {
  return {
    data: session,
    status: session ? 'authenticated' : 'unauthenticated',
    update: vi.fn(),
  };
}

/**
 * Mock fetch for API calls
 */
export function mockFetch(data: any, status = 200) {
  return vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    })
  );
}

/**
 * Mock bcrypt for password hashing
 */
export function mockBcrypt() {
  return {
    hash: vi.fn().mockImplementation((data) => Promise.resolve(`hashed_${data}`)),
    compare: vi.fn().mockImplementation((data, hash) => Promise.resolve(hash === `hashed_${data}`)),
  };
}

/**
 * Create a mock for a React component
 */
export function createMockComponent(displayName: string) {
  const component = ({ children, ...props }: any) => (
    <div data-testid={`mock-${displayName}`} {...props}>
      {children}
    </div>
  );
  component.displayName = displayName;
  return component;
}

/**
 * Wait for a specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random string
 */
export function randomString(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
