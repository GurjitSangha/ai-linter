import OpenAI from 'openai';

type Props = {
  systemMsg: string;
  userMsg: string;
  openai: OpenAI;
};

export default async function ({ systemMsg, userMsg, openai }: Props): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: userMsg },
      ],
    });
    const responseMessageContent = response?.choices?.[0]?.message?.content;
    if (responseMessageContent) {
      return responseMessageContent;
    } else {
      return 'Unable to parse GPT result';
    }
  } catch (error) {
    console.error(error);
    return 'Error fetching GPT result';
  }
}
