import { NextResponse } from 'next/server';

// Proxy hits user-service directly (not via gateway) to avoid JWT auth requirements on the server side
const USER_SERVICE_URL = 'http://127.0.0.1:8081/api/v1/user';

async function getPresignedUrl(url) {
  const backendGetUrl = `${USER_SERVICE_URL}/s3/get?url=${encodeURIComponent(url)}`;
  const signRes = await fetch(backendGetUrl, { cache: 'no-store' });

  if (signRes.ok) {
    const signData = await signRes.json();
    if (signData.signed_url) return signData.signed_url;
  } else {
    console.warn('Proxy: Could not get presigned URL from backend, trying direct fetch:', signRes.status);
  }
  return url; // fallback to direct URL
}

export async function HEAD(request) {
  const { searchParams } = new URL(request.url);
  let url = searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });

  if (url.startsWith('/')) {
    const reqUrl = new URL(request.url);
    url = `${reqUrl.origin}${url}`;
  }

  try {
    const fetchUrl = await getPresignedUrl(url);
    // CRITICAL: MinIO/S3 presigned URLs include the HTTP method in their signature.
    // A URL signed for GET will return 403 if we send a HEAD request.
    // So we must use GET here, but we don't consume the body, which saves bandwidth.
    const response = await fetch(fetchUrl, { method: 'GET', cache: 'no-store' });
    
    // We must read or cancel the body to free up the connection, but since we are just returning
    // a new NextResponse without a body, Next.js handles closing the upstream stream.
    return new NextResponse(null, { status: response.status });
  } catch (error) {
    console.error('Proxy HEAD error:', error.message);
    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // If the url is relative, make it absolute using the request url's origin
  if (url.startsWith('/')) {
    const reqUrl = new URL(request.url);
    url = `${reqUrl.origin}${url}`;
  }

  try {
    const fetchUrl = await getPresignedUrl(url);

    // Step 2: Fetch the actual file using the presigned URL
    // Note: Do NOT replace localhost with 127.0.0.1 — the presigned URL was signed
    // with 'localhost:9000' as Host, replacing it would cause SignatureDoesNotMatch (403).
    // Node.js resolves localhost correctly on this system.
    const response = await fetch(fetchUrl, { cache: 'no-store' });

    if (!response.ok) {
      console.error('Proxy API failed to fetch MinIO URL:', {
        url: fetchUrl,
        status: response.status,
        statusText: response.statusText
      });
      return NextResponse.json({ error: `Failed to fetch the URL: ${response.status} ${response.statusText}` }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const headers = new Headers();

    // Copy relevant headers
    const contentType = response.headers.get('content-type');
    if (contentType) headers.set('Content-Type', contentType);
    else headers.set('Content-Type', 'application/pdf'); // fallback for PDF viewer

    // Allow CORS
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Proxy error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
