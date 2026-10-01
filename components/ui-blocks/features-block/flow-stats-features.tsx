import { FeaturesBlockProps, Stat } from './shared';

// ── Flow (منتوما) — secondary-tone stats bar ───────────────────────────────

export const FLOW_STATS: Stat[] = [
  { value: '۱۲هزار+', label: 'یادگیرنده فعال' },
  { value: '۹۴٪', label: 'نرخ تکمیل' },
  { value: '۳۲۰+', label: 'مربی متخصص' },
  { value: '۴.۹★', label: 'میانگین امتیاز' },
];

export function FlowStatsFeatures({ id, config }: FeaturesBlockProps) {
  const stats = config?.stats?.length ? config.stats : FLOW_STATS;

  return (
    <section id={id || 'stats'} className="bg-(--theme-secondary) px-[48px] py-[52px]">
      <div className="mx-auto grid max-w-[1240px] gap-[40px] text-center sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i}>
            <div className="mb-[8px] text-[48px] leading-none font-black text-(--theme-primary)">
              {s.value}
            </div>
            <div className="text-[14px] font-medium text-(--theme-on-secondary)/70">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
