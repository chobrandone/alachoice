import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

// Guard against any accidental DB hit: the service layer must never be reached
// for invalid payloads (validation runs first).
vi.mock('../src/services/submission.service.js', () => ({
  createInquiry: vi.fn(async () => ({ id: 'x' })),
  createQuote: vi.fn(async () => ({ id: 'x' })),
  subscribeNewsletter: vi.fn(async () => ({ id: 'x' })),
}));

const app = createApp();

describe('POST /api/v1/inquiries validation', () => {
  it('rejects an empty body with 400', async () => {
    const res = await request(app).post('/api/v1/inquiries').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a filled honeypot (company) with 400', async () => {
    const res = await request(app).post('/api/v1/inquiries').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello, I would like a consultation.',
      company: 'bot-filled-this', // honeypot must stay empty
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a malformed email with 400', async () => {
    const res = await request(app).post('/api/v1/inquiries').send({
      name: 'Jane Doe',
      email: 'not-an-email',
      message: 'Hello there, this is a valid length message.',
    });
    expect(res.status).toBe(400);
  });
});
