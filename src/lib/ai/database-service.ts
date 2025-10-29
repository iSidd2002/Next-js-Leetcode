// Database service for AI recommendations and insights
import { PrismaClient } from '@prisma/client';
import { SimilarProblemsResponse, ReviewInsightsResponse } from './prompts';

const prisma = new PrismaClient({
  // Disable transactions to avoid replica set requirement
  transactionOptions: {
    maxWait: 2000,
    timeout: 5000,
  }
});

export interface AIRecommendationData {
  userId: string;
  problemId: string;
  platform: string;
  type: 'similar-problems' | 'personalized-suggestions';
  recommendations: SimilarProblemsResponse;
  cacheKey: string;
  expiresAt: Date;
  metadata: {
    modelUsed: string;
    tokensUsed?: number;
    cost?: number;
    processingTime?: number;
  };
}

export interface AIReviewInsightData {
  userId: string;
  problemId: string;
  platform: string;
  userHistory: any;
  reviewContext: any;
  insights: ReviewInsightsResponse;
  cacheKey: string;
  expiresAt: Date;
  metadata: {
    modelUsed: string;
    tokensUsed?: number;
    cost?: number;
    processingTime?: number;
  };
}

export class AIDatabaseService {
  
  // ===== AI Recommendations =====
  
  /**
   * Save AI recommendation to database
   */
  static async saveRecommendation(data: AIRecommendationData) {
    try {
      const recommendation = await prisma.aIRecommendation.create({
        data: {
          userId: data.userId,
          problemId: data.problemId,
          platform: data.platform,
          type: data.type,
          recommendations: data.recommendations.recommendations,
          analysis: data.recommendations.analysis,
          promptType: data.type,
          modelUsed: data.metadata.modelUsed,
          tokensUsed: data.metadata.tokensUsed,
          cost: data.metadata.cost,
          processingTime: data.metadata.processingTime,
          cacheKey: data.cacheKey,
          expiresAt: data.expiresAt,
          isValid: true
        }
      });
      
      console.log(`💾 Saved AI recommendation to database: ${recommendation.id}`);
      return recommendation;
    } catch (error) {
      console.error('❌ Failed to save AI recommendation:', error);
      throw error;
    }
  }

  /**
   * Get AI recommendation from database
   */
  static async getRecommendation(cacheKey: string) {
    try {
      const recommendation = await prisma.aIRecommendation.findUnique({
        where: { cacheKey },
        include: { user: { select: { id: true, username: true } } }
      });
      
      if (!recommendation) {
        return null;
      }
      
      // Check if expired
      if (new Date() > recommendation.expiresAt || !recommendation.isValid) {
        console.log(`🗑️ AI recommendation expired or invalid: ${recommendation.id}`);
        await this.invalidateRecommendation(recommendation.id);
        return null;
      }
      
      console.log(`✅ Retrieved AI recommendation from database: ${recommendation.id}`);
      return {
        recommendations: recommendation.recommendations,
        analysis: recommendation.analysis,
        metadata: {
          modelUsed: recommendation.modelUsed,
          tokensUsed: recommendation.tokensUsed,
          cost: recommendation.cost,
          processingTime: recommendation.processingTime,
          createdAt: recommendation.createdAt
        }
      };
    } catch (error) {
      console.error('❌ Failed to get AI recommendation:', error);
      return null;
    }
  }

  /**
   * Get user's recommendation history
   */
  static async getUserRecommendations(userId: string, limit: number = 10) {
    try {
      const recommendations = await prisma.aIRecommendation.findMany({
        where: { 
          userId,
          isValid: true,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          problemId: true,
          platform: true,
          type: true,
          recommendations: true,
          analysis: true,
          createdAt: true,
          cost: true,
          tokensUsed: true
        }
      });
      
      return recommendations;
    } catch (error) {
      console.error('❌ Failed to get user recommendations:', error);
      return [];
    }
  }

  // ===== AI Review Insights =====
  
  /**
   * Save AI review insight to database
   */
  static async saveReviewInsight(data: AIReviewInsightData) {
    try {
      const insight = await prisma.aIReviewInsight.create({
        data: {
          userId: data.userId,
          problemId: data.problemId,
          platform: data.platform,
          userHistory: data.userHistory,
          reviewContext: data.reviewContext,
          reviewStrategy: data.insights.review_strategy,
          keyConcepts: data.insights.key_concepts,
          practiceSuggestions: data.insights.practice_suggestions,
          confidenceAssessment: data.insights.confidence_assessment,
          personalizedNotes: data.insights.personalized_notes,
          modelUsed: data.metadata.modelUsed,
          tokensUsed: data.metadata.tokensUsed,
          cost: data.metadata.cost,
          processingTime: data.metadata.processingTime,
          cacheKey: data.cacheKey,
          expiresAt: data.expiresAt,
          isValid: true
        }
      });
      
      console.log(`💾 Saved AI review insight to database: ${insight.id}`);
      return insight;
    } catch (error) {
      console.error('❌ Failed to save AI review insight:', error);
      throw error;
    }
  }

  /**
   * Get AI review insight from database
   */
  static async getReviewInsight(cacheKey: string) {
    try {
      const insight = await prisma.aIReviewInsight.findUnique({
        where: { cacheKey },
        include: { user: { select: { id: true, username: true } } }
      });
      
      if (!insight) {
        return null;
      }
      
      // Check if expired
      if (new Date() > insight.expiresAt || !insight.isValid) {
        console.log(`🗑️ AI review insight expired or invalid: ${insight.id}`);
        await this.invalidateReviewInsight(insight.id);
        return null;
      }
      
      console.log(`✅ Retrieved AI review insight from database: ${insight.id}`);
      return {
        review_strategy: insight.reviewStrategy,
        key_concepts: insight.keyConcepts,
        practice_suggestions: insight.practiceSuggestions,
        confidence_assessment: insight.confidenceAssessment,
        personalized_notes: insight.personalizedNotes,
        metadata: {
          modelUsed: insight.modelUsed,
          tokensUsed: insight.tokensUsed,
          cost: insight.cost,
          processingTime: insight.processingTime,
          createdAt: insight.createdAt
        }
      };
    } catch (error) {
      console.error('❌ Failed to get AI review insight:', error);
      return null;
    }
  }

  /**
   * Get user's review insights history
   */
  static async getUserReviewInsights(userId: string, limit: number = 10) {
    try {
      const insights = await prisma.aIReviewInsight.findMany({
        where: { 
          userId,
          isValid: true,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          problemId: true,
          platform: true,
          reviewStrategy: true,
          confidenceAssessment: true,
          createdAt: true,
          cost: true,
          tokensUsed: true
        }
      });
      
      return insights;
    } catch (error) {
      console.error('❌ Failed to get user review insights:', error);
      return [];
    }
  }

  // ===== Usage Statistics =====
  
  /**
   * Update daily usage statistics
   */
  static async updateUsageStats(
    userId: string,
    type: 'similar-problems' | 'review-insights',
    metadata: {
      tokensUsed?: number;
      cost?: number;
      responseTime?: number;
      cacheHit?: boolean;
    }
  ) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      const updateData: any = {
        totalRequests: { increment: 1 },
        totalTokensUsed: { increment: metadata.tokensUsed || 0 },
        totalCost: { increment: metadata.cost || 0 }
      };
      
      if (type === 'similar-problems') {
        updateData.similarProblemsRequests = { increment: 1 };
      } else {
        updateData.reviewInsightsRequests = { increment: 1 };
      }
      
      if (metadata.cacheHit) {
        updateData.cacheHits = { increment: 1 };
      } else {
        updateData.cacheMisses = { increment: 1 };
      }
      
      // Update response time statistics
      if (metadata.responseTime) {
        const existing = await prisma.aIUsageStats.findUnique({
          where: { userId_date: { userId, date: today } }
        });
        
        if (existing) {
          updateData.avgResponseTime = Math.round(
            ((existing.avgResponseTime || 0) + metadata.responseTime) / 2
          );
          updateData.maxResponseTime = Math.max(
            existing.maxResponseTime || 0,
            metadata.responseTime
          );
          updateData.minResponseTime = Math.min(
            existing.minResponseTime || metadata.responseTime,
            metadata.responseTime
          );
        } else {
          updateData.avgResponseTime = metadata.responseTime;
          updateData.maxResponseTime = metadata.responseTime;
          updateData.minResponseTime = metadata.responseTime;
        }
      }
      
      const stats = await prisma.aIUsageStats.upsert({
        where: { userId_date: { userId, date: today } },
        update: updateData,
        create: {
          userId,
          date: today,
          ...updateData
        }
      });
      
      return stats;
    } catch (error) {
      console.error('❌ Failed to update usage stats:', error);
      return null;
    }
  }

  // ===== Utility Methods =====
  
  /**
   * Invalidate expired recommendations
   */
  static async invalidateRecommendation(id: string) {
    try {
      await prisma.aIRecommendation.update({
        where: { id },
        data: { isValid: false }
      });
    } catch (error) {
      console.error('❌ Failed to invalidate recommendation:', error);
    }
  }

  /**
   * Invalidate expired review insights
   */
  static async invalidateReviewInsight(id: string) {
    try {
      await prisma.aIReviewInsight.update({
        where: { id },
        data: { isValid: false }
      });
    } catch (error) {
      console.error('❌ Failed to invalidate review insight:', error);
    }
  }

  /**
   * Clean up expired entries (run periodically)
   */
  static async cleanupExpiredEntries() {
    try {
      const now = new Date();
      
      const [recommendations, insights] = await Promise.all([
        prisma.aIRecommendation.updateMany({
          where: { expiresAt: { lt: now } },
          data: { isValid: false }
        }),
        prisma.aIReviewInsight.updateMany({
          where: { expiresAt: { lt: now } },
          data: { isValid: false }
        })
      ]);
      
      console.log(`🧹 Cleaned up ${recommendations.count} recommendations and ${insights.count} insights`);
      return { recommendations: recommendations.count, insights: insights.count };
    } catch (error) {
      console.error('❌ Failed to cleanup expired entries:', error);
      return { recommendations: 0, insights: 0 };
    }
  }
}

export default AIDatabaseService;
