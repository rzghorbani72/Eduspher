import { NextResponse, type NextRequest } from 'next/server';

import { env } from '@/lib/env';
import { ENAMAD_CODE, isPlatformEnamadHost, parseEnamadTxtPath } from '@/lib/seo/enamad';

function emptyTxt(): NextResponse {
  return new NextResponse('', {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function notFoundTxt(): NextResponse {
  return new NextResponse('Not found', {
    status: 404,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

/**
 * eNamad asks for an empty `{code}.txt` at the domain root. That path is
 * otherwise bypassed as a static file, so the edge serves it here.
 */
export async function maybeEnamadTxtResponse(request: NextRequest): Promise<NextResponse | null> {
  const code = parseEnamadTxtPath(request.nextUrl.pathname);
  if (!code) return null;

  const host = request.headers.get('host') ?? '';
  if (code === ENAMAD_CODE && isPlatformEnamadHost(host)) {
    return emptyTxt();
  }

  const hostname = host.split(':')[0] ?? '';
  try {
    const response = await fetch(
      `${env.backendOrigin}${env.backendApiPath}/compliance/public/enamad-proof?host=${encodeURIComponent(hostname)}`,
      {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      },
    );
    if (!response.ok) return notFoundTxt();
    const payload = (await response.json()) as {
      data?: { code?: string | null; proofs_live?: boolean };
      code?: string | null;
      proofs_live?: boolean;
    };
    const proof = payload.data ?? payload;
    if (proof.proofs_live && proof.code === code) {
      return emptyTxt();
    }
  } catch {
    return notFoundTxt();
  }
  return notFoundTxt();
}
