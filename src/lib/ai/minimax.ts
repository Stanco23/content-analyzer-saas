import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildAnalysisPrompt, AnalysisOptions } from './prompts';
import { parseAnalysisResponse, estimateTokens } from './parsers';

const config = {
  apiKey: process.env.MINIMAX_API_KEY!,
  // For China users use: https://api.minimaxi.com/anthropic
  // For international users use: https://api.minimax.io/anthropic
  baseUrl: 'https://api.minimax.io/anthropic',
  model: 'MiniMax-M2.1',
};

// Initialize Anthropic client - standard SDK setup
const client = new Anthropic({
  apiKey: config.apiKey,
  baseURL: config.baseUrl,
});

interface AnalyzeContentInput {
  content: string;
  title?: string;
  options?: AnalysisOptions;
}

export async function analyzeContent({ content, title, options = {} }: AnalyzeContentInput) {
  const startTime = Date.now();

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const characterCount = content.length;

  const prompt = buildAnalysisPrompt(content, title, options);

  try {
    // Use Anthropic SDK as recommended in the docs
    const message = await client.messages.create({
      model: config.model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt },
      ],
    });

    // Extract text from response
    const textBlock = message.content.find(block => block.type === 'text');
    const analysisText = textBlock?.type === 'text' ? textBlock.text : '';

    if (!analysisText) {
      throw new Error('No content in API response');
    }

    const analysisData = parseAnalysisResponse(analysisText);
    const processingTimeMs = Date.now() - startTime;

    // Get usage statistics from the response
    const tokensUsed = message.usage ? message.usage.input_tokens + message.usage.output_tokens : estimateTokens(content + prompt);

    return {
      id: `analysis_${crypto.randomUUID()}`,
      word_count: wordCount,
      character_count: characterCount,
      readability: analysisData.readability,
      seo: analysisData.seo,
      suggestions: analysisData.suggestions,
      tokens_used: tokensUsed,
      processing_time_ms: processingTimeMs,
    };
  } catch (error: any) {
    console.error('Content analysis error:', error);
    throw new Error(`Content analysis failed: ${error.message}`);
  }
}
