import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Get all problems for the user
    const allProblems = await Problem.find({ userId: user.id }).sort({ createdAt: -1 });

    // Categorize problems by source
    const problemsBySource = {
      manual: allProblems.filter(p => p.source === 'manual' || !p.source),
      company: allProblems.filter(p => p.source === 'company'),
      potd: allProblems.filter(p => p.source === 'potd'),
      other: allProblems.filter(p => p.source && !['manual', 'company', 'potd'].includes(p.source))
    };

    // Get company breakdown
    const companyProblems = problemsBySource.company;
    const companyCounts = companyProblems.reduce((acc, problem) => {
      problem.companies.forEach(company => {
        acc[company] = (acc[company] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Get recent imports (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentImports = allProblems.filter(p => 
      new Date(p.createdAt) > yesterday && p.source === 'company'
    );

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total: allProblems.length,
          manual: problemsBySource.manual.length,
          company: problemsBySource.company.length,
          potd: problemsBySource.potd.length,
          other: problemsBySource.other.length
        },
        companies: companyCounts,
        recentImports: recentImports.length,
        recentImportDetails: recentImports.map(p => ({
          title: p.title,
          companies: p.companies,
          createdAt: p.createdAt,
          source: p.source
        })),
        sampleProblems: {
          manual: problemsBySource.manual.slice(0, 3).map(p => ({
            title: p.title,
            source: p.source || 'undefined',
            createdAt: p.createdAt
          })),
          company: problemsBySource.company.slice(0, 3).map(p => ({
            title: p.title,
            source: p.source,
            companies: p.companies,
            createdAt: p.createdAt
          }))
        }
      }
    });

  } catch (error) {
    console.error('Debug import status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
