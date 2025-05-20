import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/api-keys - Get all API keys for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const searchParams = req.nextUrl.searchParams;
    const service = searchParams.get('service');

    const whereClause = {
      userId,
      ...(service ? { service } : {}),
      active: true,
    };

    const apiKeys = await prisma.apiKey.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        service: true,
        keyName: true,
        keyValue: true,
        label: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        additionalData: true,
      },
    });

    // Mask API key values for security
    const maskedApiKeys = apiKeys.map(key => ({
      ...key,
      keyValue: `${key.keyValue.substring(0, 4)}...${key.keyValue.substring(key.keyValue.length - 4)}`,
    }));

    return NextResponse.json(maskedApiKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching API keys' },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create a new API key
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { service, keyName, keyValue, label, additionalData } = await req.json();

    // Validate input
    if (!service || !keyName || !keyValue) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create API key
    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        service,
        keyName,
        keyValue,
        label,
        additionalData: additionalData || undefined,
        active: true,
      },
    });

    return NextResponse.json(
      {
        id: apiKey.id,
        service: apiKey.service,
        keyName: apiKey.keyName,
        keyValue: `${apiKey.keyValue.substring(0, 4)}...${apiKey.keyValue.substring(apiKey.keyValue.length - 4)}`,
        label: apiKey.label,
        active: apiKey.active,
        createdAt: apiKey.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the API key' },
      { status: 500 }
    );
  }
}
