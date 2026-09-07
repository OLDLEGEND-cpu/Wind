import { GoogleGenerativeAI } from '@google/generative-ai';

export const AVAILABLE_MODELS = [
  { id: 'gemini-3.6-flash', label: 'Wind Fast', description: 'Quick, versatile responses (Gemini 3.6)' },
  { id: 'gemini-3.7-flash', label: 'Wind Pro', description: 'Deeper reasoning, longer context (Gemini 3.7)' }
] as const;

export type GeminiRole = 'user' | 'model';

export interface GeminiHistoryItem {
  role: GeminiRole;
  parts: { text: string }[];
}

function resolveModelName(model: string): string {
  if (model === 'gemini-2.0-flash' || model === 'gemini-1.5-flash' || !model) return 'gemini-3.6-flash';
  if (model === 'gemini-1.5-pro') return 'gemini-3.7-flash';
  return model;
}

function getClient(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

const SYSTEM_PREAMBLE = `You are Wind, a helpful, precise, and friendly AI assistant built by Wind AI.
Format responses in clean Markdown. Use fenced code blocks with language tags for any code.
Be concise by default but thorough when the user asks for depth. Never claim to be a Google product;
you are Wind, an independent assistant.`;

export function buildHistory(
  messages: { role: 'user' | 'assistant'; content: string }[]
): GeminiHistoryItem[] {
  return messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));
}

interface StreamGeminiParams {
  history: GeminiHistoryItem[];
  prompt: string;
  attachment?: {
    name: string;
    mimeType: string;
    data: string;
  } | null;
  model?: string;
  temperature?: number;
  customInstructions?: string | null;
  signal?: AbortSignal;
}

export async function* streamGemini({
  history,
  prompt,
  attachment,
  model = 'gemini-3.6-flash',
  temperature = 0.7,
  customInstructions
}: StreamGeminiParams): AsyncGenerator<string, { fullText: string }, unknown> {
  const client = getClient();
  const targetModel = resolveModelName(model);

  // If real Gemini API key is configured, use live Google Gemini streaming
  if (client) {
    const systemInstruction = customInstructions
      ? `${SYSTEM_PREAMBLE}\n\nAdditional user preferences: ${customInstructions}`
      : SYSTEM_PREAMBLE;

    const genModel = client.getGenerativeModel({
      model: targetModel,
      systemInstruction,
      generationConfig: {
        temperature,
        maxOutputTokens: 8192
      }
    });

    const chat = genModel.startChat({ history });

    let messageInput: any = prompt;
    if (attachment) {
      if (attachment.mimeType.startsWith('image/')) {
        const rawBase64 = attachment.data.includes(';base64,')
          ? attachment.data.split(';base64,')[1]
          : attachment.data;
        messageInput = [
          prompt,
          {
            inlineData: {
              mimeType: attachment.mimeType,
              data: rawBase64
            }
          }
        ];
      } else {
        let textContent = attachment.data;
        try {
          if (attachment.data.includes(';base64,')) {
            textContent = Buffer.from(attachment.data.split(';base64,')[1], 'base64').toString('utf8');
          }
        } catch {
          // Keep raw content
        }
        messageInput = `${prompt}\n\n[Attached Document: ${attachment.name}]\n\`\`\`\n${textContent}\n\`\`\``;
      }
    }

    const result = await chat.sendMessageStream(messageInput);

    let fullText = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        fullText += text;
        yield text;
      }
    }

    return { fullText };
  }

  // Graceful local preview mode when GEMINI_API_KEY is not yet populated
  const demoChunks = [
    `Hello! I'm **Wind AI**, your intelligent assistant.\n\n`,
    `> 💡 **Notice:** Wind is ready. To enable live models, add your Gemini API key to \`.env.local\` as \`GEMINI_API_KEY=...\`.\n\n`,
    `Here is a preview of what I can help you with: **"${prompt.slice(0, 100)}"**\n\n`,
    `### Key Features Available:\n`,
    `- **Real-time token streaming**\n`,
    `- **Fenced code blocks** with copy buttons\n`,
    `- **Session history** and search\n`
  ];

  let fullText = '';
  for (const chunk of demoChunks) {
    await new Promise((resolve) => setTimeout(resolve, 60));
    fullText += chunk;
    yield chunk;
  }

  return { fullText };
}

export async function generateConversationTitle(firstMessage: string): Promise<string> {
  const client = getClient();
  if (client) {
    try {
      const model = client.getGenerativeModel({ model: 'gemini-3.6-flash' });
      const result = await model.generateContent(
        `Generate a short chat title (max 6 words, no quotes, no punctuation at the end) summarizing this user message:\n\n"${firstMessage.slice(
          0,
          500
        )}"`
      );
      const text = result.response.text().trim().replace(/^["']|["']$/g, '');
      return text.slice(0, 80) || 'New chat';
    } catch {
      // Fallback
    }
  }

  // Clean title generation fallback
  const cleaned = firstMessage
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, ' ');
  const words = cleaned.split(' ').slice(0, 5).join(' ');
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : 'New chat';
}
