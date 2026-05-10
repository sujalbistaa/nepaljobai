import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventType: string = payload?.type ?? '';
    console.log('[clerk-webhook]', eventType);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }
}
