import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { CountryFaq } from '@ala/types';

const inputCls =
  'h-10 w-full rounded-input border border-ala-grey-200 bg-white px-3 text-sm text-ala-ink focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

/** Inline editor for the countries.faqs jsonb array. */
export function CountryFaqEditor({
  value,
  onChange,
}: {
  value: CountryFaq[];
  onChange: (v: CountryFaq[]) => void;
}) {
  const faqs = value ?? [];
  const add = () =>
    onChange([...faqs, { question_en: '', question_fr: '', answer_en: '', answer_fr: '' }]);
  const update = (i: number, patch: Partial<CountryFaq>) =>
    onChange(faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const remove = (i: number) => onChange(faqs.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3 rounded-card border border-ala-grey-200 bg-ala-grey-50 p-4">
      {faqs.length === 0 && <p className="text-center text-sm text-ala-grey-500">No FAQs yet.</p>}
      {faqs.map((f, i) => (
        <div key={i} className="space-y-2 rounded-input border border-ala-grey-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ala-navy">FAQ {i + 1}</span>
            <button
              type="button"
              aria-label="Remove FAQ"
              onClick={() => remove(i)}
              className="rounded p-1.5 text-ala-red hover:bg-ala-red/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Question (EN)" value={f.question_en} onChange={(e) => update(i, { question_en: e.target.value })} />
            <input className={inputCls} placeholder="Question (FR)" value={f.question_fr ?? ''} onChange={(e) => update(i, { question_fr: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <textarea className={cn(inputCls, 'h-auto py-2')} rows={2} placeholder="Answer (EN)" value={f.answer_en ?? ''} onChange={(e) => update(i, { answer_en: e.target.value })} />
            <textarea className={cn(inputCls, 'h-auto py-2')} rows={2} placeholder="Answer (FR)" value={f.answer_fr ?? ''} onChange={(e) => update(i, { answer_fr: e.target.value })} />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline-navy" size="sm" onClick={add}>
        <Plus className="h-4 w-4" /> Add FAQ
      </Button>
    </div>
  );
}
