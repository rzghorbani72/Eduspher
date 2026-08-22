import { renderMarkdown } from "@/lib/markdown";
import { t } from "@/lib/i18n/server-translations";
import { DEFAULT_LANGUAGE, type LanguageCode } from "@/lib/i18n/config";
import { ContactChannelList } from "@/components/academy/contact-channel-list";
import type { AcademyContactLink, AcademyStaticPage } from "@/lib/api/server";

type AcademyStaticPageViewProps = {
  page: AcademyStaticPage;
  links?: AcademyContactLink[];
  language?: LanguageCode;
};

/**
 * A manager-authored About/Contact page.
 *
 * The body is Markdown rendered on the server: these pages exist to be found by
 * search engines, so the text has to be in the HTML the crawler receives, not
 * injected after hydration.
 */
export function AcademyStaticPageView({
  page,
  links = [],
  language = DEFAULT_LANGUAGE,
}: AcademyStaticPageViewProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {page.title}
      </h1>

      {page.body.trim() ? (
        <div
          className="prose-description mt-6 text-base leading-8"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }}
        />
      ) : null}

      {links.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">
            {t("academySite.waysToReach", language)}
          </h2>
          <ContactChannelList links={links} language={language} />
        </section>
      ) : null}
    </main>
  );
}
