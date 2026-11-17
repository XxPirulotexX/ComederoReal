import { NextRequest, NextResponse } from 'next/server';
import { popCommands, pushCommand } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  if (req.headers.get('x-api-key') !== process.env.ESP32_API_KEY)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const deviceId = req.nextUrl.searchParams.get('deviceId') ?? 'comedero-01';
  const commands = await popCommands(deviceId);
  return NextResponse.json({ commands });
}

export async function POST(req: NextRequest) {
  const { action, station, args } = await req.json();
  await pushCommand('comedero-01', { action, station, args: args ?? '' });
  return NextResponse.json({ ok: true });
}
