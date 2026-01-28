import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// PATCH /api/stores/[id] - update store (status, isActive)
export async function PATCH(request, { params }) {
  try {
    const { id } = params || {};
    const body = await request.json();
    const { status, isActive, userId, username } = body;

    // Determine unique selector for store: prefer id, then userId, then username
    let where = null;
    if (id) {
      where = { id };
    } else if (userId) {
      where = { userId };
    } else if (username) {
      where = { username };
    } else {
      return NextResponse.json(
        { error: 'Store identifier is required (id, userId, or username)' },
        { status: 400 },
      );
    }

    if (status === undefined && isActive === undefined) {
      return NextResponse.json(
        { error: 'At least one field (status or isActive) must be provided' },
        { status: 400 },
      );
    }

    const updateData = {};
    if (status !== undefined) {
      updateData.status = status;
      // If approving, also set isActive to true
      if (status === 'approved') {
        updateData.isActive = true;
      } else if (status === 'rejected') {
        updateData.isActive = false;
      }
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const store = await prisma.store.update({
      where,
      data: updateData,
      include: {
        user: true,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error('PATCH /api/stores/[id] error', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 },
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update store' },
      { status: 500 },
    );
  }
}
