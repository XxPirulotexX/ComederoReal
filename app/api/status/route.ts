import { NextRequest, NextResponse } from 'next/server';
import { getLastStatus, saveStatus } from '@/lib/db';

export const runtime = 'edge';

function authOk(req: NextRequest) {
  return req.headers.get('x-api-key') === process.env.ESP32_API_KEY;
}

export async function POST(req: NextRequest) {
  if (!authOk(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  await saveStatus(body);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const last = await getLastStatus();
  return NextResponse.json(last ?? { stations: [] });
}
