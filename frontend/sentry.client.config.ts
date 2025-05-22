import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Adjust this value in production, or use tracesSampler for greater control
  replaysSessionSampleRate: 0.1,
  
  // Capture 100% of the sessions where an error occurs
  replaysOnErrorSampleRate: 1.0,
  
  // Enable automatic instrumentation for the frontend
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});