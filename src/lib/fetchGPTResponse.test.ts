import OpenAI from 'openai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fetchGPTResponse from './fetchGPTResponse';

vi.mock('openai', () => {
  const openAI = vi.fn();
  openAI.mockReturnValue({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  });
  return {
    default: openAI,
  };
});

describe('fetchGPTResponse', () => {
  let openai: OpenAI;
  beforeEach(() => {
    openai = new OpenAI();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call openai with the correct data', async () => {
    const systemMsg = 'You are a linter';
    const userMsg = '<html></html>';
    await fetchGPTResponse({ systemMsg, userMsg, openai });
    expect(openai.chat.completions.create).toBeCalledTimes(1);
    expect(openai.chat.completions.create).toBeCalledWith({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: userMsg },
      ],
    });
  });
});
