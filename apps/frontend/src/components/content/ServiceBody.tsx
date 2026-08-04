import { useMemo } from 'react';
import { Check } from 'lucide-react';
import { RichText } from '@/components/ui/RichText';

/**
 * Rich-text body that may contain grouped sections, each authored as
 * `<section class="svc-group"><img><h3>…</h3>(…<ul>|<p>…)</section>`. When
 * present, those groups render as a responsive grid of image-topped cards
 * (e.g. ALA Trade sub-services, or the ATA programme pillars). Each card shows
 * either a checklist (`<ul><li>`) or a description paragraph (`<p>`). Any
 * content before the first group (intro) and after the last (outro) renders as
 * normal rich text. Bodies without groups fall back to plain rich text.
 */
type ServiceGroup = { image: string | null; title: string; items: string[]; description: string };

function isGroup(node: ChildNode): node is Element {
  return node instanceof Element && node.classList.contains('svc-group');
}

function parseBody(html: string): { intro: string; groups: ServiceGroup[]; outro: string } {
  if (typeof window === 'undefined' || !html) return { intro: html, groups: [], outro: '' };
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const groupEls = Array.from(doc.querySelectorAll('section.svc-group'));
  if (groupEls.length === 0) return { intro: html, groups: [], outro: '' };

  // Split top-level nodes into intro (before first group) and outro (after last).
  const children = Array.from(doc.body.childNodes);
  const firstIdx = children.findIndex(isGroup);
  let lastIdx = -1;
  children.forEach((n, i) => {
    if (isGroup(n)) lastIdx = i;
  });
  let intro = '';
  let outro = '';
  children.forEach((node, i) => {
    const markup = node instanceof Element ? node.outerHTML : (node.textContent ?? '');
    if (i < firstIdx) intro += markup;
    else if (i > lastIdx) outro += markup;
  });

  const groups = groupEls.map((g) => {
    const items = Array.from(g.querySelectorAll('li'))
      .map((li) => li.textContent?.trim() ?? '')
      .filter(Boolean);
    return {
      image: g.querySelector('img')?.getAttribute('src') ?? null,
      title: g.querySelector('h3')?.textContent?.trim() ?? '',
      items,
      description: items.length ? '' : (g.querySelector('p')?.textContent?.trim() ?? ''),
    };
  });

  return { intro, groups, outro };
}

export function ServiceBody({ html }: { html?: string | null }) {
  const { intro, groups, outro } = useMemo(() => parseBody(html ?? ''), [html]);

  if (groups.length === 0) return <RichText html={html} />;

  return (
    <div>
      {intro && <RichText html={intro} />}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {groups.map((g, i) => (
          <article
            key={i}
            className="flex flex-col overflow-hidden rounded-card border border-ala-grey-200 bg-white shadow-soft transition-shadow duration-300 hover:shadow-soft-lg"
          >
            {g.image && (
              <div className="aspect-[16/9] overflow-hidden bg-ala-grey-50">
                <img
                  src={g.image}
                  alt={g.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-heading text-lg font-semibold text-ala-navy">{g.title}</h3>
              {g.items.length > 0 ? (
                <ul className="mt-4 space-y-2.5">
                  {g.items.map((item, j) => (
                    <li key={j} className="flex gap-2.5 text-sm leading-relaxed text-ala-grey-500">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ala-red" strokeWidth={2.5} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                g.description && (
                  <p className="mt-3 text-sm leading-relaxed text-ala-grey-500">{g.description}</p>
                )
              )}
            </div>
          </article>
        ))}
      </div>
      {outro && <RichText html={outro} className="mt-10" />}
    </div>
  );
}
