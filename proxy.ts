import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { maybeEnamadTxtResponse } from './lib/seo/enamad-txt-response';
import { shouldBypass } from './lib/proxy/proxy-helpers';
import { authRedirect } from './lib/proxy/steps/auth-redirects';
import { buildResponse } from './lib/proxy/steps/build-response';
import { prepareAcademyRequest } from './lib/proxy/steps/prepare-academy-request';
import { resolveAcademyRoute } from './lib/proxy/steps/resolve-academy-route';
import { applySessionCookies, resolveSession } from './lib/proxy/steps/resolve-session';

export async function proxy(request: NextRequest) {
  const enamadTxt = await maybeEnamadTxtResponse(request);
  if (enamadTxt) return enamadTxt;
  if (shouldBypass(request)) return NextResponse.next();

  const resolution = await resolveAcademyRoute(request);
  if (resolution.kind === 'response') return resolution.response;
  const { route } = resolution;

  const academy = prepareAcademyRequest(request, route);
  const session = await resolveSession(request, academy.requestHeaders);

  const redirect = authRedirect(route, session);
  if (redirect) {
    const response = NextResponse.redirect(redirect.url);
    applySessionCookies(response, session);
    if (redirect.framed) academy.frame(response);
    return response;
  }

  return buildResponse(request, route, academy, session);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|api/health).*)'],
};
