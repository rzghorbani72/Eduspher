import { GraduationCap, PlayCircle, Radio } from "lucide-react";

import type { PurchaseOptionView } from "@/lib/courses/purchase-options";

export interface AccessHrefs {
  learnHref: string;
  liveClassesHref: string;
  tutoringHref: string;
}

export interface AccessTarget {
  href: string;
  actionKey: string;
  icon: typeof PlayCircle;
}

/**
 * A student can hold several ways into the same course and each is entered
 * somewhere different, so where an owned way leads is decided in one place.
 */
export function accessTargetFor(
  option: PurchaseOptionView,
  { learnHref, liveClassesHref, tutoringHref }: AccessHrefs,
): AccessTarget {
  if (option.kind === "TUTORING" || option.kind === "PRIVATE") {
    return {
      href: tutoringHref,
      actionKey: "courses.enterTutoring",
      icon: GraduationCap,
    };
  }
  if (option.kind === "SUBSCRIPTION" && option.includesLive) {
    return {
      href: liveClassesHref,
      actionKey: "courses.enterLiveClasses",
      icon: Radio,
    };
  }
  return { href: learnHref, actionKey: "courses.enterLessons", icon: PlayCircle };
}
