"use client";

import { useState } from "react";

import { useTranslation } from "@/lib/i18n/hooks";
import { postJson } from "@/lib/api/client";

/**
 * Talking to the teacher from inside the class. During the waiting period this
 * is where most of the questions land, so it stays one plain box.
 */
export const GroupClassMessages = ({ groupId }: { groupId: string }) => {
  const { t } = useTranslation();
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const send = async () => {
    if (!body.trim()) return;
    setState("sending");
    try {
      await postJson("/discussions/messages", {
        tutoring_group_id: groupId,
        body: body.trim(),
      });
      setBody("");
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder={t("account.groupMessagePlaceholder")}
        className="w-full rounded-lg border border-theme bg-transparent p-3 text-sm"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={state === "sending" || !body.trim()}
          onClick={() => void send()}
          className="rounded-lg bg-(--theme-primary) px-4 py-2 text-sm font-semibold text-(--theme-on-primary) disabled:opacity-60"
        >
          {t("account.groupMessageSend")}
        </button>
        {state === "sent" ? (
          <span className="text-sm text-muted">
            {t("account.groupMessageSent")}
          </span>
        ) : null}
        {state === "error" ? (
          <span className="text-sm text-red-500">
            {t("account.groupMessageFailed")}
          </span>
        ) : null}
      </div>
    </div>
  );
};
