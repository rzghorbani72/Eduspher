import {
  AtSign,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Send,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";

import Link from "@/components/ui/link";
import { t } from "@/lib/i18n/server-translations";
import { DEFAULT_LANGUAGE, type LanguageCode } from "@/lib/i18n/config";
import { formatLtrValue } from "@/lib/utils";
import { buildContactHref, formatContactValue } from "@/lib/academy-contact";
import type { AcademyContactChannel, AcademyContactLink } from "@/lib/api/server";

const CHANNEL_ICON: Readonly<Record<AcademyContactChannel, LucideIcon>> = {
  phone: Phone,
  email: Mail,
  address: MapPin,
  website: Globe,
  instagram: Instagram,
  telegram: Send,
  whatsapp: MessageCircle,
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,
  aparat: Play,
  eitaa: AtSign,
};

const channelLabel = (
  link: AcademyContactLink,
  language: LanguageCode,
): string =>
  link.label?.trim() || t(`academySite.channels.${link.type}`, language);

/** Numbers keep their own direction inside an RTL paragraph. */
const displayValue = (
  link: AcademyContactLink,
  language: LanguageCode,
): string => {
  const value = formatContactValue(link);
  return link.type === "phone" || link.type === "whatsapp"
    ? formatLtrValue(value, language)
    : value;
};

type ContactChannelListProps = {
  links: AcademyContactLink[];
  language?: LanguageCode;
};

/** Contact details as readable rows — used on the academy's own Contact page. */
export function ContactChannelList({
  links,
  language = DEFAULT_LANGUAGE,
}: ContactChannelListProps) {
  if (links.length === 0) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {links.map((link) => {
        const Icon = CHANNEL_ICON[link.type];
        const href = buildContactHref(link);
        const body = (
          <span className="flex items-start gap-3">
            <Icon
              className="mt-0.5 h-5 w-5 shrink-0"
              style={{ color: "var(--theme-primary)" }}
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="block text-xs opacity-60">
                {channelLabel(link, language)}
              </span>
              <span className="block break-words text-sm font-medium">
                {displayValue(link, language)}
              </span>
            </span>
          </span>
        );

        return (
          <li
            key={`${link.type}-${link.value}`}
            className="rounded-xl border p-4"
            style={{ borderColor: "var(--theme-border-color)" }}
          >
            {href ? (
              <Link
                href={href}
                className="transition-opacity hover:opacity-70"
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** The same channels as a compact icon row — used in the site footer. */
export function ContactChannelIcons({
  links,
  language = DEFAULT_LANGUAGE,
}: ContactChannelListProps) {
  const social = links.filter((link) => buildContactHref(link) !== null);
  if (social.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-4">
      {social.map((link) => {
        const Icon = CHANNEL_ICON[link.type];
        const href = buildContactHref(link);
        if (!href) return null;
        return (
          <Link
            key={`${link.type}-${link.value}`}
            href={href}
            aria-label={channelLabel(link, language)}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="opacity-40 transition-all hover:opacity-100 hover:text-[var(--theme-primary)]"
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      })}
    </div>
  );
}
