# EduSpher Storefront

EduSpher is the end-user learning marketplace for the SkillForge platform. It is built with the Next.js App Router, server-first data loading, and modern UI patterns to deliver a marketing-friendly, SEO-aware experience for prospective students.

## Features

- **SEO-ready marketing site** with hero storytelling, category highlights, and blog articles powered by the backend content API.
- **Authenticated course catalogue** that integrates with the SkillForge backend using JWT cookies and server-side requests.
- **Dynamic course detail pages** with curriculum outlines, resource links, and related course recommendations.
- **Account hub** that surfaces learner context from the session token and promotes continued engagement.
- **Responsive, accessible UI** implemented with Tailwind CSS v4, reusable primitives, and sensible defaults for dark mode.

## Project Structure

```
app/
  ├── (marketing) ... landing sections
  ├── courses/ ... catalogue & detail routes
  ├── articles/ ... blog index & detail
  └── auth/ ... login, register, password reset
components/
  ├── courses/ ... reusable course cards
  ├── layout/ ... header & footer chrome
  ├── providers/ ... auth context
  └── ui/ ... button, input, badge, card primitives
lib/
  ├── api/ ... server/client API helpers
  ├── auth/ ... session utilities
  ├── env.ts ... runtime configuration
  └── utils.ts ... formatting helpers
```

## Requirements

- Node.js 18+
- Access to the SkillForge backend (dev or staging) with CORS enabled for the frontend origin.

## Environment Variables

Copy `env.example.txt` to `.env.local` and adjust as needed:

```
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:3000
NEXT_PUBLIC_BACKEND_API_PATH=/api
NEXT_PUBLIC_DEFAULT_STORE_ID=1
NEXT_PUBLIC_DEFAULT_STORE_SLUG=child-learn
NEXT_PUBLIC_SITE_NAME=EduSpher
NEXT_PUBLIC_SITE_DESCRIPTION=Discover flexible online learning with EduSpher.
NEXT_PUBLIC_STORE_ID_COOKIE=eduspher_store_id
NEXT_PUBLIC_STORE_SLUG_COOKIE=eduspher_store_slug
NEXT_PUBLIC_STORE_NAME_COOKIE=eduspher_store_name
```

## Getting Started

```bash
npm install
npm run dev
```

- Dev server: http://localhost:5000
- API (default): http://localhost:3000

Open http://localhost:5000 to view the site. The application connects to the backend defined by `NEXT_PUBLIC_BACKEND_ORIGIN`. Authentication requests expect the backend to issue the `jwt` cookie.

## Integrating With SkillForge Backend

- The frontend uses server-side `fetch` helpers (`lib/api/server.ts`) to include the JWT cookie when retrieving protected resources such as courses.
- Client-side actions (login, register, logout) proxy directly to the backend via `fetch` with `credentials: "include"`.
- Middleware resolves the active store based on the request host (private/public domain) and stores the store context in cookies so subsequent API calls carry the correct `store_id`.
- If the backend responds with 401/403, the UI gracefully prompts users to sign in before accessing gated content.

## Development Tips

- Run the backend and frontend on separate ports (`localhost:3000` for API, `localhost:5000` for frontend) or update the env variables.
- Use `NEXT_PUBLIC_DEFAULT_STORE_SLUG` (and/or the cookies) to define which store's configuration should render when a private/public domain cannot be resolved automatically.
- Tailwind v4 uses the `@import "tailwindcss"` entrypoint and `@theme` tokens defined in `app/globals.css`.
- Use `npm run lint` to run the Next.js/ESLint checks.

## Deployment

Use `npm run build` followed by `npm run start` for a production preview. Ensure environment variables are configured in your hosting provider before deploying.
