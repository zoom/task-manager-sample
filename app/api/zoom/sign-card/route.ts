
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message parameter is required.' }, { status: 400 });
    }

    const timestamp = Date.now().toString();
    const dataToSign = `v0:${timestamp}:${message}`;

    const secret = process.env.ZOOM_CLIENT_SECRET;
    if (!secret) {
      console.error("Missing ZOOM_APP_CLIENT_SECRET in environment variables");
      return NextResponse.json({ error: "Missing secret" }, { status: 500 });
    }

    const signature = crypto
      .createHmac('sha256', secret)
      .update(dataToSign)
      .digest('hex');

    return NextResponse.json({ signature, timestamp });
  } catch (error) {
    console.error('Failed to sign the message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
