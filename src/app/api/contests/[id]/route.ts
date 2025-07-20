import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contest from '@/models/Contest';
import { authenticateRequest } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const contestData = await request.json();
    const { id } = params;

    // Check if contest exists and belongs to user
    const existingContest = await Contest.findOne({
      _id: id,
      userId: user.id
    });

    if (!existingContest) {
      return NextResponse.json({
        success: false,
        error: 'Contest not found'
      }, { status: 404 });
    }

    // Update the contest
    const updateData: Record<string, unknown> = {};
    if (contestData.name !== undefined) updateData.name = contestData.name;
    if (contestData.platform !== undefined) updateData.platform = contestData.platform;
    if (contestData.startTime !== undefined) updateData.startTime = contestData.startTime;
    if (contestData.duration !== undefined) updateData.duration = contestData.duration;
    if (contestData.url !== undefined) updateData.url = contestData.url;
    if (contestData.rank !== undefined) updateData.rank = contestData.rank;
    if (contestData.problemsSolved !== undefined) updateData.problemsSolved = contestData.problemsSolved;
    if (contestData.totalProblems !== undefined) updateData.totalProblems = contestData.totalProblems;
    if (contestData.status !== undefined) updateData.status = contestData.status;

    const updatedContest = await Contest.findByIdAndUpdate(id, updateData, { new: true });

    const formattedContest = {
      id: updatedContest!._id.toString(),
      name: updatedContest!.name,
      platform: updatedContest!.platform,
      startTime: updatedContest!.startTime,
      duration: updatedContest!.duration,
      url: updatedContest!.url,
      rank: updatedContest!.rank,
      problemsSolved: updatedContest!.problemsSolved,
      totalProblems: updatedContest!.totalProblems,
      status: updatedContest!.status
    };

    return NextResponse.json({
      success: true,
      data: formattedContest
    });

  } catch (error) {
    console.error('Update contest error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const { id } = params;

    // Check if contest exists and belongs to user
    const existingContest = await Contest.findOne({
      _id: id,
      userId: user.id
    });

    if (!existingContest) {
      return NextResponse.json({
        success: false,
        error: 'Contest not found'
      }, { status: 404 });
    }

    await Contest.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Contest deleted successfully'
    });

  } catch (error) {
    console.error('Delete contest error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
