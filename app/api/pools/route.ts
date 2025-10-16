import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Pool from '@/lib/models/Pool';

export async function GET() {
  await connectToDatabase();
  const pools = await Pool.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(pools);
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const pool = await Pool.create(body);
    return NextResponse.json(pool, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}


