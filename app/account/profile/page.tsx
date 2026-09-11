import { UserRound } from "lucide-react";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { ProfileAvatarCard } from "@/components/account/profile/profile-avatar-card";
import { ProfileIdentityCard } from "@/components/account/profile/profile-identity-card";
import { ProfileSecurityCard } from "@/components/account/profile/profile-security-card";
import { ProfileSessionsCard } from "@/components/account/profile/profile-sessions-card";
import { getProfile } from "@/lib/api/account-server";
import { getAcademyBySlug, getCurrentUser } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";
import { resolveAssetUrl } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await getSession();
  const academyContext = await getAcademyContext();
  const profileId = String(session?.profileId ?? "");

  const [user, profile, academy] = await Promise.all([
    getCurrentUser(),
    getProfile(profileId),
    academyContext.slug ? getAcademyBySlug(academyContext.slug).catch(() => null) : null,
  ]);

  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);

  // The academy decides which contact method is primary; the other one is the
  // optional backup a student can add here.
  const primaryMethod = academy?.primary_verification_method === "email" ? "email" : "phone";
  const secondaryMethod = primaryMethod === "phone" ? "email" : "phone";
  const secondaryValue = secondaryMethod === "email" ? user?.email : user?.phone_number;
  const secondaryConfirmed =
    secondaryMethod === "email" ? user?.email_confirmed : user?.phone_confirmed;

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={translate("account.profile")}
        description={translate("account.profileDescription")}
        icon={UserRound}
      />

      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <ProfileIdentityCard
          profileId={profileId}
          displayName={profile?.display_name ?? user?.display_name ?? ""}
          email={user?.email ?? null}
          phoneNumber={user?.phone_number ?? null}
          emailConfirmed={Boolean(user?.email_confirmed)}
          phoneConfirmed={Boolean(user?.phone_confirmed)}
          secondaryMethod={secondaryMethod}
          primaryMethod={primaryMethod}
          needsSecondaryMethod={!secondaryValue || !secondaryConfirmed}
          defaultCountryCode={academy?.country_code ?? undefined}
        />
        <ProfileAvatarCard
          profileId={profileId}
          displayName={profile?.display_name ?? user?.display_name ?? ""}
          avatarUrl={
            resolveAssetUrl(profile?.avatar?.url ?? user?.avatar?.url) ?? null
          }
        />
      </div>

      <ProfileSecurityCard profileId={profileId} />
      <ProfileSessionsCard />
    </div>
  );
}
