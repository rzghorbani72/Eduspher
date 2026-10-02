# Proxy steps

`proxy.ts` runs these in order. Each step reads the result of the one before.

1. `resolve-academy-route` — which academy is this request for (subdomain, custom domain, path slug, `?academy=`, cookie). An unknown host stops here: 503 if the backend is down, else the `/academy-not-found` rewrite.
2. `prepare-academy-request` — request headers and academy cookies for the render; falls back to the default academy. Also returns `frame()`, the frame-ancestors/preview headers every response gets.
3. `resolve-session` — is the visitor logged in; silently refreshes an expired token. A failed refresh call (not a rejection) never logs anyone out.
4. `auth-redirects` — logged-in user on login/register, protected route without session, bare `/account`.
5. `build-response` — rewrite to the internal route, write cookies, clean `?academy=` links.

Academies are looked up via `/academies/public/resolve`, never the capped marketing list.
