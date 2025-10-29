// Test endpoint for cache manager
import { NextRequest, NextResponse } from 'next/server';
import { getCacheManager, CacheKeys } from '@/lib/ai/cache-manager';

// Ensure this runs in Node.js runtime (not Edge Runtime)
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Cache Manager...');
    
    const cacheManager = getCacheManager();
    
    // Clear cache for clean test
    cacheManager.clear();
    
    // Test 1: Basic set/get operations
    console.log('🔄 Testing basic cache operations...');
    
    const testData = {
      message: 'This is test data',
      timestamp: Date.now(),
      problems: ['problem1', 'problem2', 'problem3']
    };
    
    const testKey = 'test-key-1';
    
    // Test cache miss
    const missResult = cacheManager.get(testKey);
    console.log(`Cache miss test: ${missResult === null ? '✅ PASS' : '❌ FAIL'}`);
    
    // Test cache set
    cacheManager.set(testKey, testData, {
      ttl: 5 * 60 * 1000, // 5 minutes
      metadata: {
        platform: 'leetcode',
        userId: 'test-user',
        promptType: 'similar-problems',
        cost: 0.001,
        tokens: 150
      }
    });
    
    // Test cache hit
    const hitResult = cacheManager.get(testKey);
    const hitSuccess = JSON.stringify(hitResult) === JSON.stringify(testData);
    console.log(`Cache hit test: ${hitSuccess ? '✅ PASS' : '❌ FAIL'}`);
    
    // Test 2: Key generation
    console.log('🔄 Testing cache key generation...');
    
    const prompt1 = 'Find similar problems to Two Sum';
    const prompt2 = 'Find similar problems to Two Sum'; // Same prompt
    const prompt3 = 'Find similar problems to Three Sum'; // Different prompt
    
    const key1 = cacheManager.generateKey(prompt1, { platform: 'leetcode' });
    const key2 = cacheManager.generateKey(prompt2, { platform: 'leetcode' });
    const key3 = cacheManager.generateKey(prompt3, { platform: 'leetcode' });
    
    const sameKeyTest = key1 === key2;
    const differentKeyTest = key1 !== key3;
    
    console.log(`Same prompt key test: ${sameKeyTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Different prompt key test: ${differentKeyTest ? '✅ PASS' : '❌ FAIL'}`);
    
    // Test 3: Specialized cache keys
    console.log('🔄 Testing specialized cache keys...');
    
    const similarKey = CacheKeys.similarProblems('problem-123', 'leetcode');
    const reviewKey = CacheKeys.reviewInsights('problem-456', 'user-789');
    const suggestKey = CacheKeys.personalizedSuggestions('user-123', { difficulty: 'medium' });
    
    console.log(`Similar problems key: ${similarKey}`);
    console.log(`Review insights key: ${reviewKey}`);
    console.log(`Personalized suggestions key: ${suggestKey}`);
    
    // Test 4: Multiple entries and statistics
    console.log('🔄 Testing multiple entries and statistics...');
    
    // Add multiple test entries
    for (let i = 0; i < 10; i++) {
      const key = `test-entry-${i}`;
      const data = { id: i, value: `test-value-${i}` };
      cacheManager.set(key, data, {
        metadata: {
          platform: i % 2 === 0 ? 'leetcode' : 'codeforces',
          userId: `user-${i % 3}`,
          promptType: 'test',
          cost: 0.001 * (i + 1),
          tokens: 100 + i * 10
        }
      });
    }
    
    // Test statistics
    const stats = cacheManager.getStats();
    console.log('📊 Cache statistics:', stats);
    
    // Test cost savings
    const costSavings = cacheManager.getCostSavings();
    console.log('💰 Cost savings:', costSavings);
    
    // Test 5: Metadata filtering
    console.log('🔄 Testing metadata filtering...');
    
    const leetcodeEntries = cacheManager.getEntriesByMetadata({ platform: 'leetcode' });
    const user0Entries = cacheManager.getEntriesByMetadata({ userId: 'user-0' });
    
    console.log(`LeetCode entries found: ${leetcodeEntries.length}`);
    console.log(`User-0 entries found: ${user0Entries.length}`);
    
    // Test 6: Cache expiration (short TTL)
    console.log('🔄 Testing cache expiration...');
    
    const shortTTLKey = 'short-ttl-test';
    cacheManager.set(shortTTLKey, { test: 'expiration' }, { ttl: 100 }); // 100ms TTL
    
    const beforeExpiry = cacheManager.has(shortTTLKey);
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const afterExpiry = cacheManager.has(shortTTLKey);
    
    console.log(`Before expiry: ${beforeExpiry ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`After expiry: ${afterExpiry ? '❌ STILL EXISTS' : '✅ EXPIRED'}`);
    
    // Final statistics
    const finalStats = cacheManager.getStats();
    
    console.log('✅ Cache manager testing completed');
    
    return NextResponse.json({
      success: true,
      data: {
        tests: {
          basicOperations: {
            cacheMiss: missResult === null,
            cacheHit: hitSuccess
          },
          keyGeneration: {
            samePromptSameKey: sameKeyTest,
            differentPromptDifferentKey: differentKeyTest,
            generatedKeys: { key1, key2, key3 }
          },
          specializedKeys: {
            similarProblems: similarKey,
            reviewInsights: reviewKey,
            personalizedSuggestions: suggestKey
          },
          metadataFiltering: {
            leetcodeEntriesCount: leetcodeEntries.length,
            user0EntriesCount: user0Entries.length
          },
          expiration: {
            beforeExpiry,
            afterExpiry,
            expirationWorking: beforeExpiry && !afterExpiry
          }
        },
        statistics: finalStats,
        costSavings: costSavings,
        summary: {
          allTestsPassed: missResult === null && hitSuccess && sameKeyTest && differentKeyTest && beforeExpiry && !afterExpiry,
          totalEntries: finalStats.totalEntries,
          hitRate: finalStats.hitRate
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Cache manager test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
