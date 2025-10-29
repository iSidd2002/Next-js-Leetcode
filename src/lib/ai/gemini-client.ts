// Gemini AI Client with Rate Limiting and Error Handling
import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

export interface AIResponse {
  content: string;
  tokens: number;
  cost: number;
  provider: string;
  model: string;
  cached?: boolean;
}

export interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  userId?: string;
}

// Rate limiting store (in-memory for now, use Redis in production)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number = 100, windowHours: number = 1) {
    this.limit = limit;
    this.windowMs = windowHours * 60 * 60 * 1000;
  }

  isAllowed(userId: string): boolean {
    const now = Date.now();
    const entry = this.store.get(userId);

    if (!entry || now > entry.resetTime) {
      this.store.set(userId, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (entry.count >= this.limit) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(userId: string): number {
    const entry = this.store.get(userId);
    if (!entry || Date.now() > entry.resetTime) {
      return this.limit;
    }
    return Math.max(0, this.limit - entry.count);
  }

  getResetTime(userId: string): number {
    const entry = this.store.get(userId);
    return entry?.resetTime || Date.now();
  }
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private rateLimiter: RateLimiter;
  private defaultModel: string;
  private fallbackModel: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.defaultModel = process.env.GEMINI_MODEL || 'models/gemini-2.5-flash';
    this.fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'models/gemini-2.5-flash-lite';
    
    const rateLimit = parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || '100');
    this.rateLimiter = new RateLimiter(rateLimit, 1);
  }

  async generateResponse(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
    const userId = options.userId || 'anonymous';

    // Check rate limiting
    if (!this.rateLimiter.isAllowed(userId)) {
      const resetTime = this.rateLimiter.getResetTime(userId);
      const waitMinutes = Math.ceil((resetTime - Date.now()) / (1000 * 60));
      throw new Error(`Rate limit exceeded. Try again in ${waitMinutes} minutes.`);
    }

    const modelName = options.model || this.defaultModel;
    
    try {
      const response = await this.callGemini(prompt, modelName, options);
      return response;
    } catch (error) {
      console.warn(`Primary model ${modelName} failed, trying fallback:`, error);
      
      // Try fallback model
      try {
        const response = await this.callGemini(prompt, this.fallbackModel, options);
        return response;
      } catch (fallbackError) {
        console.error('Both primary and fallback models failed:', fallbackError);
        throw new Error('AI service temporarily unavailable. Please try again later.');
      }
    }
  }

  private async callGemini(prompt: string, modelName: string, options: AIOptions): Promise<AIResponse> {
    const model = this.genAI.getGenerativeModel({ model: modelName });

    const generationConfig: GenerationConfig = {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxTokens || parseInt(process.env.AI_MAX_TOKENS || '2048'),
      topP: 0.8,
      topK: 40,
    };

    // Construct the full prompt with system instructions
    let fullPrompt = prompt;
    if (options.systemPrompt) {
      fullPrompt = `${options.systemPrompt}\n\n${prompt}`;
    }

    const startTime = Date.now();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig,
    });

    const response = result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('Empty response from Gemini API');
    }

    // Estimate token usage (Gemini doesn't provide exact counts)
    const estimatedTokens = this.estimateTokens(fullPrompt + content);
    const cost = this.calculateCost(estimatedTokens, modelName);

    const responseTime = Date.now() - startTime;
    console.log(`Gemini API call completed - Model: ${modelName}, Tokens: ~${estimatedTokens}, Cost: $${cost.toFixed(6)}, Time: ${responseTime}ms`);

    return {
      content: content.trim(),
      tokens: estimatedTokens,
      cost,
      provider: 'gemini',
      model: modelName,
    };
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  private calculateCost(tokens: number, model: string): number {
    // Gemini pricing (as of 2025)
    const pricing: Record<string, number> = {
      'models/gemini-2.5-flash': 0.00025 / 1000,      // $0.00025 per 1K tokens
      'models/gemini-2.5-flash-lite': 0.0001 / 1000,  // $0.0001 per 1K tokens
      'models/gemini-2.5-pro': 0.0025 / 1000,         // $0.0025 per 1K tokens
      'models/gemini-pro': 0.0005 / 1000,             // $0.0005 per 1K tokens
      'gemini-pro': 0.0005 / 1000,                    // $0.0005 per 1K tokens
      'gemini-1.5-flash': 0.00025 / 1000,             // $0.00025 per 1K tokens
      'gemini-1.5-pro': 0.0025 / 1000,                // $0.0025 per 1K tokens
      'gemini-1.0-pro': 0.0005 / 1000,                // $0.0005 per 1K tokens
    };

    const rate = pricing[model] || pricing['models/gemini-2.5-flash'];
    return tokens * rate;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateResponse(
        'Respond with exactly: "Connection successful"',
        { maxTokens: 10, userId: 'test' }
      );
      return response.content.includes('Connection successful');
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }

  getRateLimitStatus(userId: string): { remaining: number; resetTime: number } {
    return {
      remaining: this.rateLimiter.getRemainingRequests(userId),
      resetTime: this.rateLimiter.getResetTime(userId),
    };
  }

  // Utility method for structured JSON responses with retry logic
  async generateStructuredResponse<T>(
    prompt: string,
    schema: string,
    options: AIOptions = {}
  ): Promise<T> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 JSON generation attempt ${attempt}/${maxRetries}`);

        // Adjust token limits based on attempt
        const tokenMultiplier = attempt === 1 ? 1 : attempt === 2 ? 1.5 : 2;
        const adjustedTokens = Math.floor((options.maxTokens || 4096) * tokenMultiplier);

        const structuredPrompt = `${prompt}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON following this exact schema: ${schema}
- Ensure the JSON is complete and properly closed
- Do not truncate any fields or values mid-string
- Keep responses concise but complete
- If you must truncate, do it at the field level, not mid-sentence`;

        const response = await this.generateResponse(structuredPrompt, {
          ...options,
          maxTokens: adjustedTokens,
          temperature: 0.2, // Even lower temperature for more consistent JSON
        });

        const result = this.parseJSONResponse<T>(response.content, attempt);
        console.log(`✅ JSON parsing successful on attempt ${attempt}`);
        return result;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Attempt ${attempt} failed:`, error instanceof Error ? error.message : error);

        if (attempt === maxRetries) {
          console.error('❌ All JSON generation attempts failed');
          break;
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw lastError || new Error('Failed to generate valid JSON after all attempts');
  }

  private parseJSONResponse<T>(content: string, attempt: number): T {
    try {
      // Clean the response content by removing markdown code blocks if present
      let cleanContent = content.trim();

      // Remove markdown code blocks (```json ... ``` or ``` ... ```)
      if (cleanContent.startsWith('```')) {
        const lines = cleanContent.split('\n');
        // Remove first line (```json or ```)
        lines.shift();
        // Remove last line (```)
        if (lines[lines.length - 1].trim() === '```') {
          lines.pop();
        }
        cleanContent = lines.join('\n').trim();
      }

      // Try to fix common JSON truncation issues
      if (attempt > 1) {
        cleanContent = this.attemptJSONRepair(cleanContent);
      }

      return JSON.parse(cleanContent) as T;
    } catch (error) {
      console.error(`❌ Failed to parse JSON response on attempt ${attempt}. Raw content:`, content);
      console.error('❌ Parse error:', error);
      throw new Error(`AI returned invalid JSON format (attempt ${attempt}): ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private attemptJSONRepair(content: string): string {
    try {
      // Common fixes for truncated JSON
      let fixed = content;

      // If it ends with incomplete string, try to close it
      if (fixed.match(/[^"\\]$/)) {
        // Check if we're in the middle of a string value
        const lastQuoteIndex = fixed.lastIndexOf('"');
        const lastColonIndex = fixed.lastIndexOf(':');

        if (lastColonIndex > lastQuoteIndex) {
          // We're likely in a string value, try to close it
          fixed += '"';
        }
      }

      // Try to close incomplete objects/arrays
      const openBraces = (fixed.match(/\{/g) || []).length;
      const closeBraces = (fixed.match(/\}/g) || []).length;
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/\]/g) || []).length;

      // Add missing closing braces
      for (let i = 0; i < openBraces - closeBraces; i++) {
        fixed += '}';
      }

      // Add missing closing brackets
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        fixed += ']';
      }

      console.log('🔧 Attempted JSON repair');
      return fixed;
    } catch (error) {
      console.error('❌ JSON repair failed:', error);
      return content; // Return original if repair fails
    }
  }

  // Batch processing for multiple requests
  async generateBatchResponses(
    requests: Array<{ prompt: string; options?: AIOptions }>,
    userId: string
  ): Promise<AIResponse[]> {
    const results: AIResponse[] = [];
    
    for (const request of requests) {
      try {
        const response = await this.generateResponse(request.prompt, {
          ...request.options,
          userId,
        });
        results.push(response);
        
        // Small delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Batch request failed:', error);
        // Continue with other requests even if one fails
        results.push({
          content: '',
          tokens: 0,
          cost: 0,
          provider: 'gemini',
          model: 'error',
        });
      }
    }
    
    return results;
  }
}

// Singleton instance
let geminiClient: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    geminiClient = new GeminiClient();
  }
  return geminiClient;
}
