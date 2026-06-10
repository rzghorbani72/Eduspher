interface ProjectItem {
  title: string;
  author: string;
  likes: string;
  large?: boolean;
}

import { PlaceholderCard } from "./slot-grid";
import { resolveSlots, type SlotConfig } from "@/lib/slot-config";
import { getCurrentAcademy } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

interface ProjectsBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    projects?: ProjectItem[];
    slots?: SlotConfig[];
    text?: Record<string, string>;
  };
}

// Decorative gradient tiles built only from theme tokens, cycled per card.
const TILE_GRADIENTS = [
  "bg-[linear-gradient(135deg,var(--theme-primary),color-mix(in_srgb,var(--theme-primary)_40%,var(--theme-secondary)))]",
  "bg-[linear-gradient(135deg,var(--theme-accent),color-mix(in_srgb,var(--theme-accent)_55%,var(--theme-primary)))]",
  "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--theme-primary)_65%,var(--theme-accent)),var(--theme-secondary))]",
  "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--theme-accent)_70%,var(--theme-primary)),color-mix(in_srgb,var(--theme-primary)_50%,var(--theme-secondary)))]",
  "bg-[linear-gradient(135deg,var(--theme-secondary),color-mix(in_srgb,var(--theme-primary)_45%,var(--theme-secondary)))]",
];

const DEFAULT_PROJECTS: ProjectItem[] = [
  { title: "مجموعه طراحی شخصیت", author: "توسط میرا کوالسکی", likes: "۲۸۴", large: true },
  { title: "سری ساعت طلایی", author: "توسط تاو چن", likes: "۱۴۲" },
  { title: "ریدیزاین اپ مالی", author: "توسط آمارا سینگ", likes: "۹۸" },
  { title: "کیت بازطراحی برند", author: "توسط لئو دومون", likes: "۲۱۱" },
  { title: "ریل لوپ ۱۴۰۵", author: "توسط زوی پارک", likes: "۱۷۶" },
];

export async function ProjectsBlock({ id, config }: ProjectsBlockProps) {
  const currentAcademy = await getCurrentAcademy().catch(() => null);
  const language = getAcademyLanguage(currentAcademy?.language || null, currentAcademy?.country_code || null);
  const tr = (key: string) => t(key, language);

  const title = config?.text?.title ?? config?.title ?? tr("blocks.projectsTitle");
  const subtitle = config?.text?.subtitle ?? config?.subtitle ?? tr("blocks.projectsSubtitle");
  const projects = config?.projects?.length ? config.projects : DEFAULT_PROJECTS;

  return (
    <section id={id || "projects"} className="bg-(--theme-surface) py-[80px]">
      <div className="mx-auto max-w-[1200px] px-[40px]">
        <div className="mb-[56px] text-center">
          <h2 className="mb-[12px] text-[36px] font-black text-(--theme-foreground)">{title}</h2>
          <p className="mx-auto max-w-[480px] text-[15px] text-(--theme-muted)">{subtitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-[16px] lg:grid-cols-4">
          {resolveSlots(projects, config?.slots, projects.length).map((slot, i) => {
            if (slot.kind !== "live") return <PlaceholderCard key={i} text={slot.text} />;
            const project = slot.data;
            return (
            <div
              key={i}
              className={`group relative aspect-square overflow-hidden rounded-[16px] transition-transform duration-200 hover:scale-[1.03] ${
                project.large ? "col-span-2 row-span-2" : ""
              }`}
            >
              <div className={`h-full w-full ${TILE_GRADIENTS[i % TILE_GRADIENTS.length]}`} />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,transparent_50%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="absolute right-3 top-3 rounded-full bg-white/90 px-[10px] py-[4px] text-[12px] font-extrabold text-black opacity-0 transition-opacity group-hover:opacity-100">
                ❤️ {project.likes}
              </div>
              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-[16px] text-right opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="mb-[4px] text-[13px] font-extrabold text-white">{project.title}</div>
                <div className="text-[11px] font-semibold text-white/80">{project.author}</div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
