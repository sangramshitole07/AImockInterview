import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const updateData = await request.json();

    // Update user profile
    const user = await User.findByIdAndUpdate(
      payload.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { language, score, questionsAnswered, skillRatings } = await request.json();

    // Find user and update interview data
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update profile statistics
    const totalInterviews = user.profile.totalInterviews + 1;
    const currentAverage = user.profile.averageScore || 0;
    const newAverage = ((currentAverage * (totalInterviews - 1)) + score) / totalInterviews;

    // Add to recent performance
    const recentPerformance = [
      ...user.profile.recentPerformance.slice(-9), // Keep last 9
      {
        date: new Date(),
        language,
        score,
        questionsAnswered,
      }
    ];

    // Update skill ratings
    const updatedSkillRatings = new Map(user.profile.skillRatings);
    if (skillRatings) {
      Object.entries(skillRatings).forEach(([skill, rating]) => {
        updatedSkillRatings.set(skill, rating as number);
      });
    }

    // Update user
    await User.findByIdAndUpdate(payload.userId, {
      $set: {
        'profile.totalInterviews': totalInterviews,
        'profile.averageScore': newAverage,
        'profile.recentPerformance': recentPerformance,
        'profile.skillRatings': updatedSkillRatings,
      },
      $addToSet: {
        'profile.selectedLanguages': language,
      },
    });

    return NextResponse.json({
      message: 'Interview data recorded successfully',
    });
  } catch (error: any) {
    console.error('Record interview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}