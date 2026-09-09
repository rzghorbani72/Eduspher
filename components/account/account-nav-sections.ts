import type { AnimateNavIcon } from "@/components/account/animated-hover-icon";
import { BellIcon } from "@animateicons/react/lucide/bell-icon";
import { BookOpenIcon } from "@animateicons/react/lucide/book-open-icon";
import { BookmarkIcon } from "@animateicons/react/lucide/bookmark-icon";
import { CircleCheckIcon } from "@animateicons/react/lucide/circle-check-icon";
import { ClipboardIcon } from "@animateicons/react/lucide/clipboard-icon";
import { ClockIcon } from "@animateicons/react/lucide/clock-icon";
import { CreditCardIcon } from "@animateicons/react/lucide/credit-card-icon";
import { InfoIcon } from "@animateicons/react/lucide/info-icon";
import { MessageCircleIcon } from "@animateicons/react/lucide/message-circle-icon";
import { RepeatIcon } from "@animateicons/react/lucide/repeat-icon";
import { SettingsIcon } from "@animateicons/react/lucide/settings-icon";
import { SparklesIcon } from "@animateicons/react/lucide/sparkles-icon";
import { UserIcon } from "@animateicons/react/lucide/user-icon";
import { VideoIcon } from "@animateicons/react/lucide/video-icon";
import { WalletIcon } from "@animateicons/react/lucide/wallet-icon";

export type AccountNavItemDef = {
  segment: string;
  labelKey: string;
  icon: AnimateNavIcon;
};

export type AccountNavSection = {
  titleKey: string;
  icon: AnimateNavIcon;
  items: AccountNavItemDef[];
};

export const ACCOUNT_NAV_SECTIONS: AccountNavSection[] = [
  {
    titleKey: "account.navLearning",
    icon: BookOpenIcon,
    items: [
      { segment: "/courses", labelKey: "account.myCourses", icon: VideoIcon },
      {
        segment: "/progress",
        labelKey: "account.myProgress",
        icon: BookmarkIcon,
      },
      {
        segment: "/assignments",
        labelKey: "account.myWork",
        icon: ClipboardIcon,
      },
      {
        segment: "/results",
        labelKey: "account.results",
        icon: CircleCheckIcon,
      },
      {
        segment: "/certificates",
        labelKey: "account.certificates",
        icon: SparklesIcon,
      },
      { segment: "/classes", labelKey: "account.myClasses", icon: ClockIcon },
      {
        segment: "/tutoring",
        labelKey: "account.privateTutoring",
        icon: MessageCircleIcon,
      },
    ],
  },
  {
    titleKey: "account.navBilling",
    icon: WalletIcon,
    items: [
      {
        segment: "/transactions",
        labelKey: "account.transactions",
        icon: CreditCardIcon,
      },
      {
        segment: "/subscriptions",
        labelKey: "account.subscriptions",
        icon: RepeatIcon,
      },
    ],
  },
  {
    titleKey: "account.navAccount",
    icon: SettingsIcon,
    items: [
      { segment: "/profile", labelKey: "account.profile", icon: UserIcon },
      {
        segment: "/notifications",
        labelKey: "notifications.title",
        icon: BellIcon,
      },
      { segment: "/support", labelKey: "support.title", icon: InfoIcon },
    ],
  },
];
