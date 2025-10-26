import { aisdk, AiSdkModel } from '@openai/agents-extensions';
import { createOpenAI } from '@ai-sdk/openai';

// OpenRouter configuration
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': 'http://localhost:8000', // Optional: for OpenRouter analytics
    'X-Title': 'Clay Pit AI', // Optional: for OpenRouter analytics
  }
});

// Model definitions
export const ModelConfig = {
  // NVIDIA Nemotron Ultra for complex reasoning and persona work
  nemotronUltra: aisdk(openrouter('nvidia/llama-3.1-nemotron-ultra-253b-v1')),
  
  // Fallback to OpenAI models (keep existing behavior)
  gpt4: 'gpt-4.1' as const,
  gpt5: 'gpt-5' as const,
};

// Environment-based model selection
export function getDefaultModel(): AiSdkModel | string {
  const useNemotron = process.env.USE_NEMOTRON === 'true';
  if (useNemotron) {
    console.log('🚀 Using NVIDIA Nemotron via OpenRouter');
    return ModelConfig.nemotronUltra;
  }
  console.log('🤖 Using OpenAI GPT-4.1');
  return ModelConfig.gpt4;
}

export function getReasoningModel(): AiSdkModel | string {
  const useNemotron = process.env.USE_NEMOTRON === 'true';
  if (useNemotron) {
    console.log('🚀 Using NVIDIA Nemotron via OpenRouter (reasoning mode)');
    return ModelConfig.nemotronUltra;
  }
  console.log('🤖 Using OpenAI GPT-5');
  return ModelConfig.gpt5;
}
