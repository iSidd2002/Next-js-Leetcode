import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { checkRateLimit, getRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limiter';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for public endpoint (very generous since this is a health check)
    const rateLimit = checkRateLimit(request, RateLimitPresets.READ_ONLY);
    if (rateLimit.limited) {
      const headers = getRateLimitHeaders(rateLimit, RateLimitPresets.READ_ONLY);
      return NextResponse.json({
        success: false,
        error: 'Too many requests'
      }, {
        status: 429,
        headers
      });
    }
    const startTime = Date.now();

    // Check database connectivity
    let dbStatus = 'disconnected';
    let dbResponseTime = 0;

    try {
      const dbStart = Date.now();
      await connectDB();
      dbResponseTime = Date.now() - dbStart;
      dbStatus = 'connected';
    } catch (error) {
      console.error('Database health check failed:', error);
      dbStatus = 'error';
    }

    // Check environment variables (only check presence, don't expose which ones)
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NEXTAUTH_SECRET'];
    const allEnvVarsPresent = requiredEnvVars.every(key => !!process.env[key]);

    // Calculate total response time
    const totalResponseTime = Date.now() - startTime;

    // Determine overall health status
    const isHealthy = dbStatus === 'connected' && allEnvVarsPresent;

    // In production, only return minimal health info
    const isProduction = process.env.NODE_ENV === 'production';

    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${totalResponseTime}ms`,
      // Only include detailed info in development
      ...(isProduction ? {} : {
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {
          database: {
            status: dbStatus,
            responseTime: `${dbResponseTime}ms`,
          },
          environment: {
            status: allEnvVarsPresent ? 'ok' : 'missing_variables',
          },
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            unit: 'MB',
          },
        },
      }),
    };

    // Return appropriate status code
    const statusCode = isHealthy ? 200 : 503;

    return NextResponse.json(healthData, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  }
}

// Also support HEAD requests for simple health checks
export async function HEAD(request: NextRequest) {
  try {
    // Quick database connectivity check
    await connectDB();
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
