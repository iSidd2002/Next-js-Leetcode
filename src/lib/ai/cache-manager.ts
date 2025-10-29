// AI Response Cache Manager
// Multi-layer caching system for AI recommendations to reduce API costs

import crypto from 'crypto';

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;           // Time to live in milliseconds
  expiresAt: number;     // Absolute expiration timestamp
  metadata?: {
    platform?: string;
    userId?: string;
    promptType?: string;
    cost?: number;
    tokens?: number;
  };
}

export interface CacheStats {
  totalEntries: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  totalSize: number;     // Approximate size in bytes
  oldestEntry?: number;  // Timestamp
  newestEntry?: number;  // Timestamp
}

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private hitCount = 0;
  private missCount = 0;
  private maxSize: number;
  private defaultTTL: number;

  constructor(options: {
    maxSize?: number;      // Maximum number of entries
    defaultTTL?: number;   // Default TTL in hours
  } = {}) {
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = (options.defaultTTL || 24) * 60 * 60 * 1000; // Convert hours to ms
    
    // Clean up expired entries every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  /**
   * Generate cache key from prompt and options
   */
  generateKey(prompt: string, options: any = {}): string {
    const keyData = {
      prompt: prompt.trim(),
      platform: options.platform,
      userId: options.userId,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      promptType: options.promptType
    };
    
    const keyString = JSON.stringify(keyData);
    return crypto.createHash('sha256').update(keyString).digest('hex').substring(0, 16);
  }

  /**
   * Get cached response
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return entry.data as T;
  }

  /**
   * Set cached response
   */
  set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;        // TTL in milliseconds
      metadata?: any;
    } = {}
  ): void {
    const ttl = options.ttl || this.defaultTTL;
    const now = Date.now();
    
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: now,
      ttl,
      expiresAt: now + ttl,
      metadata: options.metadata
    };

    // If cache is full, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(e => e.timestamp);
    
    return {
      totalEntries: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: this.hitCount + this.missCount > 0 
        ? this.hitCount / (this.hitCount + this.missCount) 
        : 0,
      totalSize: this.estimateSize(),
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : undefined
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    console.log(`🧹 Cache cleanup: removed ${removedCount} expired entries`);
    return removedCount;
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 10% of entries
    const toRemove = Math.max(1, Math.floor(entries.length * 0.1));
    
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    console.log(`🗑️ Cache eviction: removed ${toRemove} oldest entries`);
  }

  /**
   * Estimate cache size in bytes (approximate)
   */
  private estimateSize(): number {
    let totalSize = 0;
    
    for (const entry of this.cache.values()) {
      // Rough estimation: JSON string length * 2 (for UTF-16)
      totalSize += JSON.stringify(entry).length * 2;
    }
    
    return totalSize;
  }

  /**
   * Get entries by metadata criteria
   */
  getEntriesByMetadata(criteria: {
    platform?: string;
    userId?: string;
    promptType?: string;
  }): CacheEntry[] {
    const results: CacheEntry[] = [];
    
    for (const entry of this.cache.values()) {
      if (!entry.metadata) continue;
      
      let matches = true;
      
      if (criteria.platform && entry.metadata.platform !== criteria.platform) {
        matches = false;
      }
      if (criteria.userId && entry.metadata.userId !== criteria.userId) {
        matches = false;
      }
      if (criteria.promptType && entry.metadata.promptType !== criteria.promptType) {
        matches = false;
      }
      
      if (matches) {
        results.push(entry);
      }
    }
    
    return results;
  }

  /**
   * Calculate cost savings from cache hits
   */
  getCostSavings(): {
    totalHits: number;
    estimatedSavings: number;  // In USD
    averageCostPerRequest: number;
  } {
    const entries = Array.from(this.cache.values());
    const costsWithMetadata = entries
      .filter(e => e.metadata?.cost)
      .map(e => e.metadata!.cost!);
    
    const averageCost = costsWithMetadata.length > 0 
      ? costsWithMetadata.reduce((sum, cost) => sum + cost, 0) / costsWithMetadata.length
      : 0.001; // Default estimate
    
    return {
      totalHits: this.hitCount,
      estimatedSavings: this.hitCount * averageCost,
      averageCostPerRequest: averageCost
    };
  }
}

// Singleton instance for global use
let globalCacheManager: CacheManager | null = null;

export function getCacheManager(): CacheManager {
  if (!globalCacheManager) {
    globalCacheManager = new CacheManager({
      maxSize: parseInt(process.env.AI_CACHE_MAX_SIZE || '1000'),
      defaultTTL: parseInt(process.env.AI_CACHE_TTL_HOURS || '24')
    });
  }
  return globalCacheManager;
}

// Cache key generators for specific use cases
export const CacheKeys = {
  similarProblems: (problemId: string, platform: string) => 
    `similar:${platform}:${problemId}`,
  
  reviewInsights: (problemId: string, userId: string) => 
    `review:${userId}:${problemId}`,
  
  personalizedSuggestions: (userId: string, preferences: any) => 
    `suggest:${userId}:${crypto.createHash('md5').update(JSON.stringify(preferences)).digest('hex')}`,
  
  platformNormalization: (problemData: any, platform: string) => 
    `normalize:${platform}:${crypto.createHash('md5').update(JSON.stringify(problemData)).digest('hex')}`
};
