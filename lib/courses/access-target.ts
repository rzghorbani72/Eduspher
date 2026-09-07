import { GraduationCap, PlayCircle, Radio } from "lucide-react";

import type { CourseAccessType } from "@/lib/api/account-types";
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

/** Where the "how you got in" row should send the student. */
export function accessTargetForType(
  type: CourseAccessType,
  { learnHref, tutoringHref }: AccessHrefs,
): AccessTarget {
  if (type === "TUTORING") {
    return {
      href: tutoringHref,
      actionKey: "courses.enterTutoring",
      icon: GraduationCap,
    };
  }
  return { href: learnHref, actionKey: "courses.enterLessons", icon: PlayCircle };
}
