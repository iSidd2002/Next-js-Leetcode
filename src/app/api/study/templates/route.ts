import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CodeTemplate } from '@/models/StudyFeatures';
import { authenticateRequest } from '@/lib/auth';

// GET /api/study/templates - Get code templates
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

    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const category = searchParams.get('category');
    const pattern = searchParams.get('pattern');
    const includePublic = searchParams.get('includePublic') === 'true';

    // Build query - get user's templates and optionally public ones
    const queries = [{ userId: user.id }];
    
    if (includePublic) {
      queries.push({ isPublic: true });
    }

    const baseQuery: any = { $or: queries };
    
    if (language) baseQuery.language = language;
    if (category) baseQuery.category = category;
    if (pattern) baseQuery.pattern = new RegExp(pattern, 'i');

    const templates = await CodeTemplate.find(baseQuery)
      .sort({ usageCount: -1, updatedAt: -1 })
      .populate('userId', 'username');

    return NextResponse.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST /api/study/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      language, 
      category, 
      pattern, 
      code, 
      usage, 
      timeComplexity, 
      spaceComplexity, 
      tags, 
      isPublic 
    } = body;

    // Validation
    if (!name || !description || !language || !category || !pattern || !code || !usage) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const template = new CodeTemplate({
      userId: user.id,
      name: name.trim(),
      description: description.trim(),
      language,
      category,
      pattern: pattern.trim(),
      code: code.trim(),
      usage: usage.trim(),
      timeComplexity: timeComplexity || 'O(?)',
      spaceComplexity: spaceComplexity || 'O(?)',
      tags: tags || [],
      isPublic: isPublic || false
    });

    await template.save();

    return NextResponse.json({
      success: true,
      data: template
    }, { status: 201 });

  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
