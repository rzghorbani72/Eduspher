import { notFound } from 'next/navigation';

import { LiveRoomShell } from '@/components/live/live-room-shell';
import { buildLiveRoomFixture } from '@/lib/live/live-room-fixture';

/**
 * Playwright-only classroom. Available in non-production; production needs
 * E2E_FIXTURES=1 so it never ships as a real student route.
 */
export default async function E2eLiveRoomFixturePage({
  searchParams,
}: {
  searchParams: Promise<{ closed?: string; select?: string }>;
}) {
  if (process.env.NODE_ENV === 'production' && process.env.E2E_FIXTURES !== '1') {
    notFound();
  }

  const params = await searchParams;
  const linkOpen = params.closed !== '1';
  const room = buildLiveRoomFixture({ linkOpen });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8" data-testid="e2e-live-room">
      <h1 className="text-2xl font-bold">{room.title}</h1>
      <LiveRoomShell
        room={room}
        currentProfileId="profile-e2e"
        invitePath={null}
        courseHref="/courses/e2e"
        displayName="E2E Student"
      />
    </div>
  );
}
