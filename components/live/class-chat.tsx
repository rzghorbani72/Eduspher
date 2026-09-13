"use client";

import { useState } from "react";

import { DiscussionThread } from "@/components/discussion/discussion-thread";
import { PillButton } from "@/components/live/pill-button";
import { useTranslation } from "@/lib/i18n/hooks";

type ChatScope = "session" | "group" | "private";

interface ClassChatProps {
  sessionId: string | null;
  groupThreadParent: string | null;
  privateThreadParent: string | null;
  currentProfileId: string;
}

/**
 * Three conversations can live in one classroom: about the meeting on screen,
 * the class together (group classes only), and the student alone with the
 * teacher. The meeting's own thread is the default, so what was said about a
 * past session is found by clicking that session.
 */
export function ClassChat({
  sessionId,
  groupThreadParent,
  privateThreadParent,
  currentProfileId,
}: ClassChatProps) {
  const { t } = useTranslation();
  const [scope, setScope] = useState<ChatScope>(
    sessionId ? "session" : "private",
  );
  const active: ChatScope =
    scope === "session" && !sessionId ? "private" : scope;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {sessionId ? (
          <PillButton
            active={active === "session"}
            onClick={() => setScope("session")}
            label={t("live.chatSession")}
          />
        ) : null}
        {groupThreadParent ? (
          <PillButton
            active={active === "group"}
            onClick={() => setScope("group")}
            label={t("live.chatGroup")}
          />
        ) : null}
        {privateThreadParent ? (
          <PillButton
            active={active === "private"}
            onClick={() => setScope("private")}
            label={t("live.chatPrivate")}
          />
        ) : null}
      </div>

      {active === "session" && sessionId ? (
        <DiscussionThread
          key={`session-${sessionId}`}
          sessionId={sessionId}
          currentProfileId={currentProfileId}
          title={t("live.chatSession")}
          placeholder={t("live.chatSessionPlaceholder")}
        />
      ) : active === "group" && groupThreadParent ? (
        <DiscussionThread
          key="group"
          groupId={groupThreadParent}
          currentProfileId={currentProfileId}
          title={t("live.chatGroup")}
          placeholder={t("live.chatGroupPlaceholder")}
        />
      ) : (
        <DiscussionThread
          key="private"
          engagementId={privateThreadParent ?? undefined}
          currentProfileId={currentProfileId}
          title={t("live.chatPrivate")}
          placeholder={t("live.chatPrivatePlaceholder")}
        />
      )}
    </div>
  );
}
