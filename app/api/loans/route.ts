import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Loan from '@/lib/models/Loan';

export async function GET() {
  await connectToDatabase();
  const loans = await Loan.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(loans);
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const loan = await Loan.create(body);
    return NextResponse.json(loan, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}


