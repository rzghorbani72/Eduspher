'use client';

import { useMemo, useState } from 'react';
import Link from '@/components/ui/link';
import { Input } from '@/components/ui/input';
import { Building2, ExternalLink, Search } from 'lucide-react';
import { buildAcademyPath } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import type { StoreSummary } from '@/lib/api/types';

type AcademyDirectoryClientProps = {
  academies: StoreSummary[];
};

export function AcademyDirectoryClient({ academies }: AcademyDirectoryClientProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return academies;
    return academies.filter(
      (academy) =>
        academy.name.toLowerCase().includes(query) ||
        (academy.slug ?? '').toLowerCase().includes(query) ||
        (academy.domain?.public_address ?? '').toLowerCase().includes(query),
    );
  }, [academies, searchTerm]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-[var(--theme-foreground)]">
        {t('panel.academiesHeading')}
      </h2>

      <div className="relative mb-8">
        <label htmlFor="academy-search" className="sr-only">
          {t('panel.searchAcademies')}
        </label>
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          id="academy-search"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('panel.searchAcademies')}
          className="ps-10"
          autoComplete="off"
        />
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-theme border py-12 text-center shadow-sm"
          style={{ borderColor: 'var(--theme-border-color)' }}
        >
          <Building2 className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <p className="text-lg font-semibold text-[var(--theme-foreground)]">
            {searchTerm
              ? t('panel.noMatch').replace('{query}', searchTerm)
              : t('panel.noAcademies')}
          </p>
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="mt-4 text-sm font-semibold text-[var(--theme-primary)] hover:underline"
            >
              {t('panel.clearSearch')}
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((academy) => {
            const slug = academy.slug ?? String(academy.id);
            const href = buildAcademyPath(slug, '/');
            const domainLabel =
              academy.domain?.public_address ?? academy.domain?.private_address ?? slug;

            return (
              <li key={academy.id}>
                <Link
                  href={href}
                  className="group rounded-theme flex h-full flex-col border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    borderColor: 'var(--theme-border-color)',
                    backgroundColor: 'var(--theme-card-bg)',
                    color: 'var(--theme-foreground)',
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--theme-primary)_12%,transparent)]">
                      <Building2 className="h-5 w-5 text-[var(--theme-primary)]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-lg font-semibold group-hover:text-[var(--theme-primary)]">
                        {academy.name}
                      </span>
                      <span className="block truncate text-sm opacity-60">{domainLabel}</span>
                    </span>
                  </div>
                  <span className="mt-auto inline-flex items-center text-sm font-semibold text-[var(--theme-primary)]">
                    {t('panel.visitAcademy')}
                    <ExternalLink className="ms-2 h-4 w-4" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
