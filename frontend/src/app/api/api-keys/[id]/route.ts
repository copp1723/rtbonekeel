import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/api-keys/[id] - Get a specific API key
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const id = params.id;

    const apiKey = await prisma.apiKey.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { message: 'API key not found' },
        { status: 404 }
      );
    }

    // Mask API key value for security
    const maskedApiKey = {
      ...apiKey,
      keyValue: `${apiKey.keyValue.substring(0, 4)}...${apiKey.keyValue.substring(apiKey.keyValue.length - 4)}`,
    };

    return NextResponse.json(maskedApiKey);
  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the API key' },
      { status: 500 }
    );
  }
}

// PUT /api/api-keys/[id] - Update an API key
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const id = params.id;
    const { keyValue, label, additionalData, active } = await req.json();

    // Check if API key exists and belongs to user
    const existingApiKey = await prisma.apiKey.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!existingApiKey) {
      return NextResponse.json(
        { message: 'API key not found' },
        { status: 404 }
      );
    }

    // Update API key
    const updatedApiKey = await prisma.apiKey.update({
      where: {
        id,
      },
      data: {
        ...(keyValue ? { keyValue } : {}),
        ...(label !== undefined ? { label } : {}),
        ...(additionalData !== undefined ? { additionalData } : {}),
        ...(active !== undefined ? { active } : {}),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      id: updatedApiKey.id,
      service: updatedApiKey.service,
      keyName: updatedApiKey.keyName,
      keyValue: `${updatedApiKey.keyValue.substring(0, 4)}...${updatedApiKey.keyValue.substring(updatedApiKey.keyValue.length - 4)}`,
      label: updatedApiKey.label,
      active: updatedApiKey.active,
      updatedAt: updatedApiKey.updatedAt,
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the API key' },
      { status: 500 }
    );
  }
}

// DELETE /api/api-keys/[id] - Delete an API key
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const id = params.id;

    // Check if API key exists and belongs to user
    const existingApiKey = await prisma.apiKey.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!existingApiKey) {
      return NextResponse.json(
        { message: 'API key not found' },
        { status: 404 }
      );
    }

    // Delete API key (or mark as inactive)
    await prisma.apiKey.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json(
      { message: 'API key deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the API key' },
      { status: 500 }
    );
  }
}
