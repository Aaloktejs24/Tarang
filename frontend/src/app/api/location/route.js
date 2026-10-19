import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://ip-api.com/json/', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ available: false });
    }

    const data = await response.json();
    
    if (data.status === 'fail') {
      return NextResponse.json({ available: false });
    }

    return NextResponse.json({
      latitude: data.lat,
      longitude: data.lon,
      region: data.regionName,
      city: data.city,
    });
  } catch {
    return NextResponse.json({ available: false });
  }
}
