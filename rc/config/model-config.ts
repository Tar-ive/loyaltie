import { aisdk, AiSdkModel } from '@openai/agents-extensions';
import { createOpenAI } from '@ai-sdk/openai';

// Lazy initialization of OpenRouter to ensure env vars are loaded
let _openrouterInstance: ReturnType<typeof createOpenAI> | null = null;

function getOpenRouter() {
  if (!_openrouterInstance) {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('No auth credentials found');
    }

    console.log('🔧 Initializing OpenRouter client with API key');
    _openrouterInstance = createOpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'HTTP-Referer': 'http://localhost:8000',
        'X-Title': 'Clay Pit AI',
      }
    });
  }
  return _openrouterInstance;
}

// Model definitions (lazy initialization)
export const ModelConfig = {
  // Fallback to OpenAI models (keep existing behavior)
  gpt4: 'gpt-4.1' as const,
  gpt5: 'gpt-5' as const,
};

// Environment-based model selection
export function getDefaultModel(): AiSdkModel | string {
  const useNemotron = process.env.USE_NEMOTRON === 'true';
  if (useNemotron) {
    console.log('🚀 Using NVIDIA Nemotron via OpenRouter');
    const openrouter = getOpenRouter();
    return aisdk(openrouter('nvidia/llama-3.1-nemotron-70b-instruct'));
  }
  console.log('🤖 Using OpenAI GPT-4.1');
  return ModelConfig.gpt4;
}

export function getReasoningModel(): AiSdkModel | string {
  const useNemotron = process.env.USE_NEMOTRON === 'true';
  if (useNemotron) {
    console.log('🚀 Using NVIDIA Nemotron via OpenRouter (reasoning mode)');
    const openrouter = getOpenRouter();
    return aisdk(openrouter('nvidia/llama-3.1-nemotron-70b-instruct'));
  }
  console.log('🤖 Using OpenAI GPT-5');
  return ModelConfig.gpt5;
}
