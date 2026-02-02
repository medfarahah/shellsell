import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/coupons?code=&onlyPublic=&forNewUser=&forMember=
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const onlyPublic = searchParams.get('onlyPublic');
  const forNewUser = searchParams.get('forNewUser');
  const forMember = searchParams.get('forMember');

  const where = {};

  if (code) where.code = code;
  if (onlyPublic === 'true') where.isPublic = true;
  if (forNewUser === 'true') where.forNewUser = true;
  if (forMember === 'true') where.forMember = true;

  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        ...where,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('GET /api/coupons error', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 },
    );
  }
}

// POST /api/coupons
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      code,
      description,
      discount,
      forNewUser,
      forMember = false,
      isPublic,
      expiresAt,
    } = body;

    if (
      !code ||
      !description ||
      typeof discount !== 'number' ||
      typeof forNewUser !== 'boolean' ||
      typeof isPublic !== 'boolean' ||
      !expiresAt
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid fields' },
        { status: 400 },
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description,
        discount,
        forNewUser,
        forMember,
        isPublic,
        expiresAt: new Date(expiresAt),
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error('POST /api/coupons error', error);
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 },
    );
  }
}

